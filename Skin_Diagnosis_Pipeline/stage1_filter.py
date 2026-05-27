"""
stage1_filter.py
────────────────
Stage 1 — Skin vs. Irrelevant image classifier (MobileNetV3-Small).

Loads the trained checkpoint and returns whether the input image shows
person skin (True) or is irrelevant (False), together with the confidence
score for the skin class.

Architecture matches training exactly:
  - MobileNetV3-Small backbone (torchvision)
  - Custom head: Linear(576→256) → Hardswish → BN → Dropout(0.3)
                 → Linear(256→32) → ReLU → Dropout(0.2) → Linear(32→2)
  - Input: 224×224 RGB, ImageNet normalisation
"""

import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


# ── Constants (must match training) ──────────────────────────────────────────
IMG_SIZE = 224
CLASS_NAMES = ["irrelevent", "person's skin"]   # index 0 = irrelevant, 1 = skin
SKIN_CLASS_IDX = 1


# ── Preprocessing ─────────────────────────────────────────────────────────────
_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std =[0.229, 0.224, 0.225]),
])


def _preprocess(img_bgr: np.ndarray) -> torch.Tensor:
    """BGR uint8 ndarray → normalised (1, 3, 224, 224) tensor."""
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    return _transform(pil_img).unsqueeze(0)


# ── Model builder (must match training exactly) ───────────────────────────────
def _build_model(num_classes: int = 2) -> nn.Module:
    model = models.mobilenet_v3_small(weights=None)

    in_features = model.classifier[0].in_features  # 576
    model.classifier = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.Hardswish(),
        nn.BatchNorm1d(256),
        nn.Dropout(0.3),
        nn.Linear(256, 32),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(32, num_classes),
    )
    return model


# ── Public API ────────────────────────────────────────────────────────────────
class Stage1Filter:
    """
    Wraps the MobileNetV3-Small skin/irrelevant classifier.

    Parameters
    ----------
    checkpoint_path : str
        Path to the saved .pth checkpoint (state-dict or wrapped dict).
    device : str | torch.device, optional
        'cuda', 'cpu', or a torch.device.  Defaults to CUDA if available.
    """

    def __init__(self, checkpoint_path: str, device=None):
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)

        self.model = _build_model(num_classes=2)
        ckpt = torch.load(checkpoint_path, map_location=self.device)
        
        # Stage 1 training saves under 'model_state' (not 'model_state_dict')
        state = ckpt.get("model_state", ckpt.get("model_state_dict", ckpt))
        self.model.load_state_dict(state, strict=True)
        self.model.to(self.device)
        self.model.eval()

    @torch.no_grad()
    def predict(self, img_bgr: np.ndarray) -> dict:
        """
        Classify a single BGR image.

        Returns
        -------
        dict with keys:
            is_skin   (bool)  – True if the image contains person skin
            skin_conf (float) – Softmax probability for the skin class [0, 1]
            label     (str)   – Human-readable predicted class name
        """
        tensor = _preprocess(img_bgr).to(self.device)
        logits = self.model(tensor)
        probs  = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        pred_idx  = int(probs.argmax())
        skin_conf = float(probs[SKIN_CLASS_IDX])
        is_skin   = pred_idx == SKIN_CLASS_IDX

        return {
            "is_skin":   is_skin,
            "skin_conf": skin_conf,
            "label":     CLASS_NAMES[pred_idx],
        }
