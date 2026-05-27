"""
calibrate_ood.py
────────────────
One-time calibration script — fits temperature + energy threshold on val set.
Paths and settings loaded from .env via config.py.

Run
───
python calibrate_ood.py
"""

import json
import os
import sys

import cv2
import numpy as np
import torch
from pathlib import Path
from torch.utils.data import Dataset, DataLoader

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stage3_classify import _build_model, IMG_SIZE, MEAN_6CH, STD_6CH, BG_FILL
from ood_detector import OODDetector
from config import STAGE3_CKPT, SKIN_ROOT, ENHANCED_ROOT, OOD_CALIB, DEVICE

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}


class ValDataset(Dataset):
    def __init__(self, skin_root, enhanced_root, split, class_to_idx):
        self.samples = []
        skin_split   = os.path.join(skin_root, split)
        for class_name in sorted(os.listdir(skin_split)):
            skin_class_dir     = os.path.join(skin_split, class_name)
            enhanced_class_dir = os.path.join(enhanced_root, split, class_name)
            if not os.path.isdir(skin_class_dir):
                continue
            if class_name not in class_to_idx:
                continue
            label = class_to_idx[class_name]
            for fname in sorted(os.listdir(skin_class_dir)):
                p = Path(fname)
                if p.suffix.lower() not in IMAGE_EXTS:
                    continue
                base          = p.stem[:-5] if p.stem.endswith("_skin") else p.stem
                skin_path     = os.path.join(skin_class_dir, fname)
                enhanced_path = os.path.join(enhanced_class_dir, base + "_enhanced.png")
                if not os.path.exists(enhanced_path):
                    continue
                self.samples.append((skin_path, enhanced_path, label))
        print(f"  [{split}] {len(self.samples)} pairs loaded.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        skin_path, enhanced_path, label = self.samples[idx]

        def _read_rgb(path):
            bgr = cv2.imread(path)
            if bgr is None:
                return np.full((IMG_SIZE, IMG_SIZE, 3), BG_FILL, dtype=np.uint8)
            return cv2.cvtColor(cv2.resize(bgr, (IMG_SIZE, IMG_SIZE)), cv2.COLOR_BGR2RGB)

        skin_rgb = _read_rgb(skin_path)
        enh_rgb  = _read_rgb(enhanced_path)
        img6 = np.concatenate([skin_rgb, enh_rgb], axis=2).astype(np.float32) / 255.0
        img6 = (img6 - MEAN_6CH) / STD_6CH
        return torch.from_numpy(img6.transpose(2, 0, 1)).float(), label


def main():
    device = torch.device(DEVICE)
    print(f"[Calibrate] Device  : {device}")
    print(f"[Calibrate] Model   : {STAGE3_CKPT}")
    print(f"[Calibrate] Skin    : {SKIN_ROOT}")
    print(f"[Calibrate] Enhanced: {ENHANCED_ROOT}")
    print(f"[Calibrate] Output  : {OOD_CALIB}")

    # ── Class names ───────────────────────────────────────────────────────────
    train_dir   = os.path.join(SKIN_ROOT, "train")
    class_names = sorted([d for d in os.listdir(train_dir)
                           if os.path.isdir(os.path.join(train_dir, d))])
    class_to_idx = {c: i for i, c in enumerate(class_names)}
    print(f"[Calibrate] {len(class_names)} classes: {class_names}")

    # ── Load model ────────────────────────────────────────────────────────────
    print("[Calibrate] Loading Stage 3 model...")
    model = _build_model(num_classes=len(class_names))
    ckpt  = torch.load(STAGE3_CKPT, map_location=device)
    state = ckpt.get("model_state_dict", ckpt)
    model.load_state_dict(state, strict=True)
    model.to(device)
    model.eval()

    # ── Validation loader ─────────────────────────────────────────────────────
    val_ds   = ValDataset(SKIN_ROOT, ENHANCED_ROOT, "valid", class_to_idx)
    test_ds  = ValDataset(SKIN_ROOT, ENHANCED_ROOT, "test",  class_to_idx)
    combined = torch.utils.data.ConcatDataset([val_ds, test_ds])
    val_loader = DataLoader(combined, batch_size=32, shuffle=False,
                            num_workers=4, pin_memory=True)

    # ── Calibrate ─────────────────────────────────────────────────────────────
    detector = OODDetector(model, device)

    print("\n[Calibrate] Step 1 — Fitting temperature scaling...")
    detector.fit_temperature(val_loader)

    print("\n[Calibrate] Step 2 — Fitting energy threshold (FPR=5%)...")
    detector.fit_threshold(val_loader, fpr=0.05)

    print("\n[Calibrate] Step 3 — Saving calibration...")
    detector.save_calibration(OOD_CALIB)

    print(f"\n{'='*55}")
    print(f"  Calibration complete.")
    print(f"  Temperature : {detector.temperature:.4f}")
    print(f"  Threshold   : {detector.threshold:.4f}")
    print(f"  Saved to    : {OOD_CALIB}")
    print(f"{'='*55}")


if __name__ == "__main__":
    main()
