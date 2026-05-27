"""
build_prototypes.py
───────────────────
Run once after training to build per-class prototype embeddings.
Paths loaded from .env via config.py.

Run
───
python build_prototypes.py
"""

import json
import os
import sys

import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path
from tqdm import tqdm

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stage3_classify import _build_model, IMG_SIZE, MEAN_6CH, STD_6CH, BG_FILL
from config import STAGE3_CKPT, SKIN_ROOT, ENHANCED_ROOT, PROTOTYPES_OUT, DEVICE

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}


class ConvNeXtEmbedder(nn.Module):
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
        x = self.norm(x)   # norm before pool — expects (B,C,H,W)
        x = self.pool(x)
        x = x.flatten(1)
        x = F.normalize(x, dim=1)
        return x


class ValPairDataset(torch.utils.data.Dataset):
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
        print(f"  [{split}] {len(self.samples)} pairs found.")

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
    print(f"[Prototypes] Device   : {device}")
    print(f"[Prototypes] Model    : {STAGE3_CKPT}")
    print(f"[Prototypes] Skin     : {SKIN_ROOT}")
    print(f"[Prototypes] Enhanced : {ENHANCED_ROOT}")
    print(f"[Prototypes] Output   : {PROTOTYPES_OUT}")

    # ── Class names ───────────────────────────────────────────────────────────
    train_dir   = os.path.join(SKIN_ROOT, "train")
    class_names = sorted([d for d in os.listdir(train_dir)
                           if os.path.isdir(os.path.join(train_dir, d))])
    class_to_idx = {c: i for i, c in enumerate(class_names)}
    num_classes  = len(class_names)
    print(f"[Prototypes] {num_classes} classes: {class_names}")

    # ── Load model ────────────────────────────────────────────────────────────
    print("[Prototypes] Loading Stage 3 model...")
    full_model = _build_model(num_classes=num_classes)
    ckpt       = torch.load(STAGE3_CKPT, map_location=device)
    state      = ckpt.get("model_state_dict", ckpt)
    full_model.load_state_dict(state, strict=True)
    full_model.to(device)
    full_model.eval()

    embedder = ConvNeXtEmbedder(full_model).to(device)
    embedder.eval()

    # ── Dataset ───────────────────────────────────────────────────────────────
    val_dataset  = ValPairDataset(SKIN_ROOT, ENHANCED_ROOT, "valid", class_to_idx)
    test_dataset = ValPairDataset(SKIN_ROOT, ENHANCED_ROOT, "test",  class_to_idx)
    combined     = torch.utils.data.ConcatDataset([val_dataset, test_dataset])
    loader       = torch.utils.data.DataLoader(combined, batch_size=32,
                                                shuffle=False, num_workers=2,
                                                pin_memory=True)

    # ── Extract embeddings ────────────────────────────────────────────────────
    all_embeddings, all_labels = [], []
    print("\n[Prototypes] Extracting embeddings from validation split...")
    with torch.no_grad():
        for imgs, labels in tqdm(loader, desc="Extracting"):
            emb = embedder(imgs.to(device))
            all_embeddings.append(emb.cpu().numpy())
            all_labels.extend(labels.tolist())

    all_embeddings = np.concatenate(all_embeddings, axis=0)
    all_labels     = np.array(all_labels)
    emb_dim        = all_embeddings.shape[1]
    print(f"[Prototypes] Total: {len(all_embeddings)} embeddings, dim: {emb_dim}")

    # ── Compute per-class prototypes ──────────────────────────────────────────
    prototypes = np.zeros((num_classes, emb_dim), dtype=np.float32)
    counts     = np.zeros(num_classes, dtype=np.int32)
    for emb, label in zip(all_embeddings, all_labels):
        prototypes[label] += emb
        counts[label]     += 1
    for i in range(num_classes):
        if counts[i] > 0:
            prototypes[i] /= counts[i]
    norms      = np.linalg.norm(prototypes, axis=1, keepdims=True)
    prototypes = prototypes / np.clip(norms, 1e-8, None)

    # ── Per-class stats ───────────────────────────────────────────────────────
    print(f"\n  {'Class':<50} {'N':>5}  {'Mean sim':>10}  {'Min sim':>10}")
    print(f"  {'-'*80}")
    min_mean_sim = 1.0
    for i, cname in enumerate(class_names):
        class_mask = all_labels == i
        if class_mask.sum() == 0:
            continue
        class_embs = all_embeddings[class_mask]
        class_embs = class_embs / np.clip(
            np.linalg.norm(class_embs, axis=1, keepdims=True), 1e-8, None)
        sims     = class_embs @ prototypes[i]
        mean_sim = float(sims.mean())
        min_sim  = float(sims.min())
        min_mean_sim = min(min_mean_sim, mean_sim)
        print(f"  {cname:<50} {int(class_mask.sum()):>5}  {mean_sim:>10.4f}  {min_sim:>10.4f}")

    suggested_threshold = round(min_mean_sim - 0.05, 3)
    print(f"\n  Suggested sim_threshold: {suggested_threshold:.3f}")

    # ── Save ──────────────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(os.path.abspath(PROTOTYPES_OUT)), exist_ok=True)
    np.save(PROTOTYPES_OUT, {
        "prototypes":          prototypes,
        "class_names":         class_names,
        "emb_dim":             emb_dim,
        "counts":              counts.tolist(),
        "suggested_threshold": suggested_threshold,
    })
    print(f"\n[Prototypes] Saved → {PROTOTYPES_OUT}")
    print(f"\n  Add to ood_calibration.json:")
    print(f'    "prototypes_path": "{PROTOTYPES_OUT}",')
    print(f'    "sim_threshold":   {suggested_threshold}')


if __name__ == "__main__":
    main()
