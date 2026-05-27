"""
stage2_seg.py
─────────────
Stage 2 — Skin-lesion segmentation (SwinV2-Base + SMP UNet, 6-channel RGB+Lab).

Responsibilities:
  1. Run the segmentation model on the input image.
  2. Decide lesion vs. clear skin via mask_ratio threshold (default 0.05).
  3. If lesion:
       a. Return the binary mask.
       b. Apply mask to original image with gray (64, 64, 64) background
          → "masked_bgr"  (used by Stage 3 as the *enhanced* branch input
            after lesion upscaling in stage2_postprocess).
  4. If clear skin: signal no-lesion.

All preprocessing reproduces training exactly:
  - Resize to 384×384
  - Convert RGB → Lab, normalise L* to [0,1], a*/b* to [0,1]
  - Concatenate → 6-channel tensor
  - Per-channel normalise with ImageNet mean/std on RGB, [0.5/0.5] on Lab
"""

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from skimage.color import rgb2lab
from skimage import measure
import segmentation_models_pytorch as smp


# ── Constants (must match training) ──────────────────────────────────────────
IMG_SIZE          = 384
MASK_THRESHOLD    = 0.5          # sigmoid → binary
MASK_RATIO_THRESH = 0.03         # fraction of pixels to call "lesion"
BG_COLOR          = (64, 64, 64) # dark-gray background (BGR)

IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
LAB_MEAN      = np.array([0.5,   0.5,   0.5  ], dtype=np.float32)
LAB_STD       = np.array([0.5,   0.5,   0.5  ], dtype=np.float32)
FULL_MEAN     = np.concatenate([IMAGENET_MEAN, LAB_MEAN])
FULL_STD      = np.concatenate([IMAGENET_STD,  LAB_STD])

# Lesion upscaling constants (used in postprocess)
MIN_SIZE_PX    = 48
OVERLAP_MARGIN = 4

# Skin masking via YCrCb (used in postprocess — prepare_pairs logic)
YCRCB_LOWER       = np.array([0,   133,  77], dtype=np.uint8)
YCRCB_UPPER       = np.array([255, 173, 127], dtype=np.uint8)
MORPH_KERNEL_SIZE = 7


# ── Preprocessing helpers ─────────────────────────────────────────────────────
def _add_lab_channels(rgb_uint8: np.ndarray) -> np.ndarray:
    """RGB uint8 (H,W,3) → 6-channel float32 [RGB | Lab], values roughly [0,1]."""
    rgb_f = rgb_uint8.astype(np.float32) / 255.0
    lab   = rgb2lab(rgb_f).astype(np.float32)
    lab[:, :, 0] /= 100.0                            # L*  → [0, 1]
    lab[:, :, 1]  = (lab[:, :, 1] + 128.0) / 255.0  # a* → [0, 1]
    lab[:, :, 2]  = (lab[:, :, 2] + 128.0) / 255.0  # b* → [0, 1]
    return np.concatenate([rgb_f, lab], axis=-1)      # (H, W, 6)


def _normalise_6ch(img6: np.ndarray) -> np.ndarray:
    return (img6 - FULL_MEAN) / FULL_STD


def _preprocess(img_bgr: np.ndarray) -> torch.Tensor:
    """BGR uint8 → normalised 6-ch tensor (1, 6, 384, 384)."""
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
    img6    = _normalise_6ch(_add_lab_channels(resized))
    tensor  = torch.from_numpy(img6.transpose(2, 0, 1)).float().unsqueeze(0)
    return tensor


# ── Post-processing helpers (prepare_pairs + stage2_enlarge_lesions logic) ──
def _extract_skin_mask_ycrcb(img_bgr: np.ndarray) -> np.ndarray:
    """
    YCrCb-based skin detector (prepare_pairs.ipynb logic).
    Returns binary mask (H, W) uint8 with values 0 or 1.
    """
    img_ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    skin_mask = cv2.inRange(img_ycrcb, YCRCB_LOWER, YCRCB_UPPER)
    kernel    = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,
                                          (MORPH_KERNEL_SIZE, MORPH_KERNEL_SIZE))
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN,  kernel)
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
    return (skin_mask > 0).astype(np.uint8)


def apply_skin_mask_ycrcb(img_bgr: np.ndarray) -> np.ndarray:
    """
    Apply YCrCb skin mask to original image (prepare_pairs.ipynb logic).
    Non-skin pixels are replaced with BG_COLOR (64, 64, 64).
    If no skin is detected, returns the full image unchanged.
    """
    skin_mask = _extract_skin_mask_ycrcb(img_bgr)
    if skin_mask.sum() == 0:
        return img_bgr.copy()
    bg  = np.full_like(img_bgr, BG_COLOR, dtype=np.uint8)
    out = np.where(skin_mask[:, :, None] == 1, img_bgr, bg)
    return out.astype(np.uint8)


def apply_seg_mask(img_bgr: np.ndarray, mask_bin: np.ndarray) -> np.ndarray:
    """
    Zero out non-lesion pixels using the segmentation binary mask.
    mask_bin: H×W uint8 (255 = lesion, 0 = background).
    Returns BGR image with gray background (64, 64, 64) where mask == 0.
    """
    bg  = np.full_like(img_bgr, BG_COLOR, dtype=np.uint8)
    out = np.where((mask_bin > 0)[:, :, None], img_bgr, bg)
    return out.astype(np.uint8)


def upscale_lesions(masked_bgr: np.ndarray) -> np.ndarray:
    """
    Enlarge small lesion blobs in-place on a gray-background image.
    Reproduces stage2_enlarge_lesions.ipynb exactly.

    Parameters
    ----------
    masked_bgr : BGR uint8 image with lesions on (64,64,64) gray background.

    Returns
    -------
    BGR uint8 image with lesion blobs upscaled to ≥ MIN_SIZE_PX on their
    largest side, without overlapping neighbouring blobs.
    """
    H, W = masked_bgr.shape[:2]
    BG_TOLERANCE = 15

    # Detect lesion pixels (anything not close to BG_COLOR)
    bg     = np.array(BG_COLOR, dtype=np.float32)
    diff   = np.abs(masked_bgr.astype(np.float32) - bg)
    not_bg = np.any(diff > BG_TOLERANCE, axis=2).astype(np.uint8)

    if not_bg.sum() == 0:
        return masked_bgr.copy()

    labeled = measure.label(not_bg, connectivity=2)
    props   = measure.regionprops(labeled)
    if not props:
        return masked_bgr.copy()

    comps = [{
        "id":   p.label,
        "cy":   p.centroid[0],
        "cx":   p.centroid[1],
        "minr": p.bbox[0], "minc": p.bbox[1],
        "maxr": p.bbox[2], "maxc": p.bbox[3],
        "h":    p.bbox[2] - p.bbox[0],
        "w":    p.bbox[3] - p.bbox[1],
    } for p in props]

    canvas    = np.full((H, W, 3), BG_COLOR, dtype=np.uint8)
    centroids = np.array([[c["cy"], c["cx"]] for c in comps])

    for i, c in enumerate(comps):
        cy, cx       = c["cy"], c["cx"]
        cur_max_side = max(c["h"], c["w"])
        desired_scale = max(1.0, MIN_SIZE_PX / max(cur_max_side, 1))

        if len(comps) > 1:
            dists       = np.linalg.norm(centroids - np.array([cy, cx]), axis=1)
            dists[i]    = np.inf
            nearest     = dists.min()
            max_reach   = (nearest - OVERLAP_MARGIN) / 2.0
            cur_half    = np.sqrt((c["h"] / 2) ** 2 + (c["w"] / 2) ** 2)
            if cur_half > 0:
                desired_scale = min(desired_scale,
                                    max(1.0, max_reach / cur_half))

        new_h = max(1, int(c["h"] * desired_scale))
        new_w = max(1, int(c["w"] * desired_scale))

        blob_mask_full = (labeled == c["id"])
        blob_crop      = blob_mask_full[c["minr"]:c["maxr"], c["minc"]:c["maxc"]]

        patch          = np.full((c["h"], c["w"], 3), BG_COLOR, dtype=np.uint8)
        patch[blob_crop] = masked_bgr[c["minr"]:c["maxr"],
                                       c["minc"]:c["maxc"]][blob_crop]

        crop_big = cv2.resize(patch, (new_w, new_h),
                               interpolation=cv2.INTER_LINEAR)
        mask_big = cv2.resize(blob_crop.astype(np.uint8), (new_w, new_h),
                               interpolation=cv2.INTER_NEAREST).astype(bool)

        r0 = max(0, int(cy - new_h / 2))
        c0 = max(0, int(cx - new_w / 2))
        r1 = min(H, r0 + new_h)
        c1 = min(W, c0 + new_w)
        dr, dc = r1 - r0, c1 - c0

        region                      = canvas[r0:r1, c0:c1]
        region_mask                 = mask_big[:dr, :dc]
        region[region_mask]         = crop_big[:dr, :dc][region_mask]
        canvas[r0:r1, c0:c1]        = region

    return canvas


# ── Model loader ──────────────────────────────────────────────────────────────
def _load_seg_model(checkpoint_path: str, device: torch.device):
    model = smp.Unet(
        encoder_name         = "tu-swinv2_base_window12to24_192to384",
        encoder_weights      = None,
        in_channels          = 6,
        classes              = 1,
        activation           = None,
        decoder_attention_type = "scse",
    )
    ckpt  = torch.load(checkpoint_path, map_location=device)
    state = ckpt.get("model_state_dict", ckpt)
    model.load_state_dict(state, strict=True)
    model.to(device)
    model.eval()
    return model


# ── Public API ────────────────────────────────────────────────────────────────
class Stage2Segmenter:
    """
    Wraps the SwinV2-Base UNet segmentation model.

    Parameters
    ----------
    checkpoint_path     : str   – Path to the .pth segmentation checkpoint.
    mask_ratio_threshold: float – Fraction of pixels needed to call "lesion".
    device              : optional str or torch.device.
    """

    def __init__(
        self,
        checkpoint_path: str,
        mask_ratio_threshold: float = MASK_RATIO_THRESH,
        device=None,
    ):
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device               = torch.device(device)
        self.mask_ratio_threshold = mask_ratio_threshold
        self.model                = _load_seg_model(checkpoint_path, self.device)

    @torch.no_grad()
    def predict(self, img_bgr: np.ndarray) -> dict:
        """
        Run segmentation on a BGR image.

        Returns
        -------
        dict with keys:
            is_lesion       (bool)      – True if mask_ratio ≥ threshold
            mask_ratio      (float)     – Fraction of pixels predicted as lesion
            mask_bin        (np.ndarray H×W uint8, 255=lesion, 0=bg)
            masked_bgr      (np.ndarray BGR, lesion pixels on gray bg)
                             – Only meaningful when is_lesion is True
            skin_masked_bgr (np.ndarray BGR, YCrCb skin mask on orig image)
            enhanced_bgr    (np.ndarray BGR, lesion-upscaled version of masked_bgr)
        """
        orig_h, orig_w = img_bgr.shape[:2]

        # ── Forward pass ──────────────────────────────────────────────────────
        tensor   = _preprocess(img_bgr).to(self.device)
        logits   = self.model(tensor)
        if isinstance(logits, (list, tuple)):
            logits = logits[0]
        logits_up = F.interpolate(logits, size=(orig_h, orig_w),
                                  mode="bilinear", align_corners=False)
        prob_map  = torch.sigmoid(logits_up).squeeze().cpu().numpy()
        mask_bin  = (prob_map >= MASK_THRESHOLD).astype(np.uint8) * 255
        mask_ratio = float((mask_bin > 0).sum()) / (orig_h * orig_w)
        is_lesion  = mask_ratio >= self.mask_ratio_threshold

        # ── Post-processing (always computed, used by Stage 3) ────────────────
        masked_bgr      = apply_seg_mask(img_bgr, mask_bin)         # lesion on gray bg
        enhanced_bgr    = upscale_lesions(masked_bgr)               # upscaled lesions
        skin_masked_bgr = apply_skin_mask_ycrcb(img_bgr)            # ycrcb skin on orig

        return {
            "is_lesion":       is_lesion,
            "mask_ratio":      mask_ratio,
            "mask_bin":        mask_bin,
            "masked_bgr":      masked_bgr,
            "skin_masked_bgr": skin_masked_bgr,
            "enhanced_bgr":    enhanced_bgr,
        }
