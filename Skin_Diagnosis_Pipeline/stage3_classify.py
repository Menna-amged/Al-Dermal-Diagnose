"""
stage3_classify.py
──────────────────
Stage 3 — 8-class skin-disease classifier (ConvNeXt-Small 384, 6-channel)
with integrated OOD detection using:

  1. Cosine similarity to class prototypes  (primary — embedding space)
  2. Top-1 confidence threshold             (secondary guard)
  3. Top-1 vs Top-2 gap threshold           (secondary guard)
  4. Energy score threshold                 (fallback)

OOD is triggered if ANY condition is true.

All thresholds live in ood_calibration.json:
{
    "temperature":      0.952,
    "threshold":       -4.4,
    "min_confidence":   0.55,
    "min_gap":          0.20,
    "prototypes_path":  "checkpoints/prototypes.npy",
    "sim_threshold":    0.75
}
"""

import json
import os
from typing import Optional

import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import timm


# ── Constants ─────────────────────────────────────────────────────────────────
IMG_SIZE    = 384
NUM_CLASSES = 8
DROP_RATE   = 0.2
DROP_PATH   = 0.3
BG_FILL     = 64

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]
MEAN_6CH      = np.array(IMAGENET_MEAN + IMAGENET_MEAN, dtype=np.float32)
STD_6CH       = np.array(IMAGENET_STD  + IMAGENET_STD,  dtype=np.float32)

UNKNOWN_LABEL = "Unknown condition - please consult a doctor"

DEFAULT_CLASS_NAMES = [
    "Acne & Rosacea",
    "Actinic Keratosis",
    "Chickenpox",
    "Eczema",
    "Monkeypox",
    "Nail Fungus",
    "SkinCancer",
    "Vitiligo",
]


# ── Preprocessing ─────────────────────────────────────────────────────────────
def _preprocess_pair(skin_masked_bgr, enhanced_bgr):
    def _to_rgb(bgr):
        if bgr is None:
            return np.full((IMG_SIZE, IMG_SIZE, 3), BG_FILL, dtype=np.uint8)
        resized = cv2.resize(bgr, (IMG_SIZE, IMG_SIZE))
        return cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

    skin_rgb = _to_rgb(skin_masked_bgr)
    enh_rgb  = _to_rgb(enhanced_bgr)

    img6 = np.concatenate([skin_rgb, enh_rgb], axis=2).astype(np.float32) / 255.0
    img6 = (img6 - MEAN_6CH) / STD_6CH
    return torch.from_numpy(img6.transpose(2, 0, 1)).float().unsqueeze(0)


# ── Model builder ─────────────────────────────────────────────────────────────
def _build_model(num_classes=NUM_CLASSES):
    model = timm.create_model(
        "convnext_small.fb_in22k_ft_in1k_384",
        pretrained=False,
        num_classes=num_classes,
        drop_rate=DROP_RATE,
        drop_path_rate=DROP_PATH,
        in_chans=3,
    )
    old_stem = model.stem[0]
    new_stem = nn.Conv2d(
        in_channels=6,
        out_channels=old_stem.out_channels,
        kernel_size=old_stem.kernel_size,
        stride=old_stem.stride,
        padding=old_stem.padding,
        bias=old_stem.bias is not None,
    )
    with torch.no_grad():
        new_stem.weight[:, :3] = old_stem.weight
        new_stem.weight[:, 3:] = (
            old_stem.weight.mean(dim=1, keepdim=True).expand(-1, 3, -1, -1)
        )
        if old_stem.bias is not None:
            new_stem.bias.data = old_stem.bias.data.clone()
    model.stem[0] = new_stem
    return model


# ── Embedding extractor (backbone without head) ───────────────────────────────
class _Embedder(nn.Module):
    """Returns the L2-normalised embedding before the final linear head."""
    def __init__(self, full_model):
        super().__init__()
        self.stem   = full_model.stem
        self.stages = full_model.stages
        self.norm   = full_model.head.norm
        self.pool   = nn.AdaptiveAvgPool2d(1)

    def forward(self, x):
        x = self.stem(x)
        for stage in self.stages:
            x = stage(x)
        # norm expects (B, C, H, W) — must come BEFORE pooling
        x = self.norm(x)
        x = self.pool(x)
        x = x.flatten(1)
        # L2-normalise so dot product == cosine similarity
        x = F.normalize(x, dim=1)
        return x


# ── Public API ────────────────────────────────────────────────────────────────
class Stage3Classifier:
    """
    6-channel ConvNeXt-Small classifier with multi-condition OOD detection.

    OOD conditions (any one triggers unknown):
      1. Cosine similarity to nearest class prototype < sim_threshold
      2. Top-1 softmax confidence < min_confidence
      3. Top-1 minus Top-2 probability gap < min_gap
      4. Energy score < threshold  (fallback if no prototypes)
    """

    def __init__(
        self,
        checkpoint_path:      str,
        class_names:          Optional[list] = None,
        ood_calibration_path: Optional[str]  = None,
        device=None,
    ):
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device      = torch.device(device)
        self.class_names = class_names or DEFAULT_CLASS_NAMES

        # ── Load full model ───────────────────────────────────────────────────
        self._full_model = _build_model(num_classes=len(self.class_names))
        ckpt  = torch.load(checkpoint_path, map_location=self.device)
        state = ckpt.get("model_state_dict", ckpt)
        self._full_model.load_state_dict(state, strict=True)
        self._full_model.to(self.device)
        self._full_model.eval()

        # ── Embedding extractor ───────────────────────────────────────────────
        self._embedder = _Embedder(self._full_model).to(self.device)
        self._embedder.eval()

        # ── OOD settings (defaults) ───────────────────────────────────────────
        self._ood_enabled        = False
        self._ood_temperature    = 1.0
        self._ood_threshold      = None      # energy threshold
        self._ood_min_confidence = 0.55
        self._ood_min_gap        = 0.20
        self._prototypes         = None      # (num_classes, emb_dim) np.float32
        self._sim_threshold      = 0.75      # cosine similarity cutoff

        if ood_calibration_path and os.path.exists(ood_calibration_path):
            self._load_ood_calibration(ood_calibration_path)
        elif ood_calibration_path:
            print(f"[Stage3] WARNING: OOD calibration file not found: {ood_calibration_path}")
            print(f"         OOD detection disabled. Run calibrate_ood.py to generate it.")

    def _load_ood_calibration(self, path: str):
        with open(path) as f:
            calib = json.load(f)

        self._ood_temperature    = float(calib.get("temperature",    1.0))
        self._ood_threshold      = float(calib.get("threshold",     -4.4))
        self._ood_min_confidence = float(calib.get("min_confidence", 0.55))
        self._ood_min_gap        = float(calib.get("min_gap",        0.20))
        self._sim_threshold      = float(calib.get("sim_threshold",  0.75))
        self._ood_enabled        = True

        # Load prototypes if path provided
        proto_path = calib.get("prototypes_path", None)
        if proto_path and os.path.exists(proto_path):
            data             = np.load(proto_path, allow_pickle=True).item()
            self._prototypes = data["prototypes"].astype(np.float32)  # (C, D)
            print(f"[Stage3] OOD detection ENABLED (prototype + energy + confidence)")
            print(f"         prototypes     = {self._prototypes.shape} loaded from {proto_path}")
        else:
            print(f"[Stage3] OOD detection ENABLED (energy + confidence only)")
            print(f"         prototypes not found — run build_prototypes.py for best results")

        print(f"         sim_threshold  = {self._sim_threshold:.3f}")
        print(f"         min_confidence = {self._ood_min_confidence:.2%}")
        print(f"         min_gap        = {self._ood_min_gap:.2%}")
        print(f"         energy thresh  = {self._ood_threshold:.4f}")
        print(f"         temperature    = {self._ood_temperature:.4f}")

    def _energy_score(self, logits: torch.Tensor) -> float:
        T = self._ood_temperature
        return float(-T * torch.logsumexp(logits / T, dim=1).item())

    def _cosine_similarity_to_prototypes(self, emb: np.ndarray):
        """
        emb: (D,) L2-normalised embedding.
        Returns (best_sim, best_class_idx) using dot product = cosine sim.
        """
        sims         = self._prototypes @ emb          # (C,)
        best_idx     = int(np.argmax(sims))
        best_sim     = float(sims[best_idx])
        return best_sim, best_idx, sims

    @property
    def ood_enabled(self):
        return self._ood_enabled

    @torch.no_grad()
    def predict(self, skin_masked_bgr, enhanced_bgr) -> dict:
        tensor = _preprocess_pair(skin_masked_bgr, enhanced_bgr).to(self.device)

        # ── Forward: embedding + logits in one pass ───────────────────────────
        emb_tensor = self._embedder(tensor)                    # (1, D) normalised
        logits     = self._full_model(tensor)                  # (1, C)

        emb = emb_tensor.squeeze(0).cpu().numpy()              # (D,)

        # ── Energy score ──────────────────────────────────────────────────────
        ood_energy    = None
        ood_threshold = None
        if self._ood_enabled:
            ood_energy    = self._energy_score(logits)
            ood_threshold = self._ood_threshold

        # ── Calibrated softmax ────────────────────────────────────────────────
        T     = self._ood_temperature if self._ood_enabled else 1.0
        probs = F.softmax(logits / T, dim=1).squeeze(0).cpu().numpy()

        sorted_probs = np.sort(probs)[::-1]
        pred_idx     = int(probs.argmax())
        confidence   = float(sorted_probs[0])
        top2_gap     = float(sorted_probs[0] - sorted_probs[1])

        prob_dict = {name: float(p) for name, p in zip(self.class_names, probs)}
        top3 = sorted(prob_dict.items(), key=lambda x: x[1], reverse=True)[:3]
        top3 = [{"class": c, "confidence": round(p, 4)} for c, p in top3]

        # ── Cosine similarity to prototypes ───────────────────────────────────
        best_sim       = None
        proto_class    = None
        all_sims       = None

        if self._ood_enabled and self._prototypes is not None:
            best_sim, proto_best_idx, all_sims = self._cosine_similarity_to_prototypes(emb)
            proto_class = self.class_names[proto_best_idx]

        # ── OOD decision ──────────────────────────────────────────────────────
        is_unknown = False
        ood_reason = None

        if self._ood_enabled:
            # 1. Primary: cosine similarity (if prototypes available)
            if self._prototypes is not None and best_sim < self._sim_threshold:
                is_unknown = True
                ood_reason = (
                    f"cosine similarity {best_sim:.4f} < threshold {self._sim_threshold:.4f} "
                    f"(closest class: '{proto_class}')"
                )
            # 2. Confidence too low
            elif confidence < self._ood_min_confidence:
                is_unknown = True
                ood_reason = f"confidence {confidence:.2%} < min {self._ood_min_confidence:.2%}"
            # 3. Top-1 and Top-2 too close
            elif top2_gap < self._ood_min_gap:
                is_unknown = True
                ood_reason = f"top-1/top-2 gap {top2_gap:.2%} < min {self._ood_min_gap:.2%}"
            # 4. Fallback: energy score
            elif ood_energy < self._ood_threshold:
                is_unknown = True
                ood_reason = f"energy {ood_energy:.4f} < threshold {self._ood_threshold:.4f}"

        # ── Build result ──────────────────────────────────────────────────────
        if is_unknown:
            predicted_class = UNKNOWN_LABEL
            predicted_idx   = -1
        else:
            predicted_class = self.class_names[pred_idx]
            predicted_idx   = pred_idx

        # Per-class similarity scores (nice for debugging)
        sim_scores = None
        if all_sims is not None:
            sim_scores = {name: round(float(s), 4)
                          for name, s in zip(self.class_names, all_sims)}

        return {
            "predicted_class": predicted_class,
            "predicted_idx":   predicted_idx,
            "confidence":      round(confidence, 4),
            "top2_gap":        round(top2_gap, 4),
            "is_unknown":      is_unknown,
            "ood_reason":      ood_reason,
            "ood_energy":      round(ood_energy, 4) if ood_energy is not None else None,
            "ood_threshold":   round(ood_threshold, 4) if ood_threshold is not None else None,
            "best_sim":        round(best_sim, 4) if best_sim is not None else None,
            "sim_threshold":   self._sim_threshold if self._ood_enabled else None,
            "sim_scores":      sim_scores,
            "probabilities":   {k: round(v, 4) for k, v in prob_dict.items()},
            "top3":            top3,
        }
