"""
test_pipeline.py
────────────────
Command-line tool to test and benchmark the full skin-lesion pipeline.
Paths and settings are loaded from .env via config.py.

Usage examples
──────────────
# Single image
python test_pipeline.py --image patient.jpg

# Folder of images
python test_pipeline.py --folder test_images/

# Save debug images
python test_pipeline.py --image patient.jpg --debug --save-dir outputs/
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prediction import SkinPipeline
from config import STAGE1_CKPT, STAGE2_CKPT, STAGE3_CKPT, OOD_CALIB, MASK_THRESHOLD, DEVICE

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}


# ── helpers ───────────────────────────────────────────────────────────────────
def collect_images(path: str) -> list:
    p = Path(path)
    if p.is_file():
        return [str(p)]
    images = []
    for root, _, files in os.walk(p):
        for f in sorted(files):
            if Path(f).suffix.lower() in IMAGE_EXTS:
                images.append(os.path.join(root, f))
    return sorted(images)


def save_debug_images(img_bgr, result, save_dir, stem):
    os.makedirs(save_dir, exist_ok=True)
    if result.debug is None:
        return
    d = result.debug
    cv2.imwrite(os.path.join(save_dir, f"{stem}_mask.png"), d["mask_bin"])
    overlay     = img_bgr.copy()
    color_layer = np.zeros_like(img_bgr)
    color_layer[d["mask_bin"] > 0] = (0, 255, 0)
    overlay = cv2.addWeighted(overlay, 1.0, color_layer, 0.35, 0)
    contours, _ = cv2.findContours(d["mask_bin"], cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(overlay, contours, -1, (0, 0, 255), 2)
    cv2.imwrite(os.path.join(save_dir, f"{stem}_overlay.jpg"), overlay)
    cv2.imwrite(os.path.join(save_dir, f"{stem}_skin.jpg"),     d["skin_masked_bgr"])
    cv2.imwrite(os.path.join(save_dir, f"{stem}_enhanced.png"), d["enhanced_bgr"])
    print(f"    Debug images saved → {save_dir}/{stem}_*")


def print_result(img_path, result, elapsed_ms):
    d = result.to_dict()
    print(f"\n{'─'*60}")
    print(f"  Image   : {img_path}")
    print(f"  Time    : {elapsed_ms:.1f} ms")
    print(f"  Status  : {d['status'].upper()}")
    print(f"  Message : {d['message']}")

    if d["status"] == "unknown_condition":
        print(f"\n  ┌─ OOD / Unknown ──────────────────────────────────────")
        print(f"  │  {d['predicted_class']}")
        print(f"  │  Reason     : {d['ood_reason']}")
        if d.get("best_sim") is not None:
            print(f"  │  Best sim   : {d['best_sim']:.4f}  (threshold: {d['sim_threshold']})")
        print(f"  │  Energy     : {d['ood_energy']}  (threshold: {d['ood_threshold']})")
        print(f"  │  Confidence : {d['confidence']:.1%}")
        print(f"  │  Top-2 gap  : {d['top2_gap']:.2%}")
        print(f"  │  Mask cover : {d['mask_ratio']:.2%}")
        if d.get("sim_scores"):
            print(f"  ├─ Similarity to each class ───────────────────────────")
            for cls, sim in sorted(d["sim_scores"].items(), key=lambda x: x[1], reverse=True):
                bar = "█" * int(max(0, sim) * 30)
                print(f"  │  {cls:<45} {sim:>6.4f}  {bar}")
        print(f"  └──────────────────────────────────────────────────────")

    elif d["status"] == "lesion_detected":
        print(f"\n  ┌─ Prediction ─────────────────────────────────────────")
        print(f"  │  Class      : {d['predicted_class']}")
        print(f"  │  Confidence : {d['confidence']:.1%}")
        if d.get("best_sim") is not None:
            print(f"  │  Best sim   : {d['best_sim']:.4f}  (threshold: {d['sim_threshold']})")
        print(f"  │  Mask cover : {d['mask_ratio']:.2%}")
        if d.get("ood_energy") is not None:
            print(f"  │  OOD energy : {d['ood_energy']}  (threshold: {d['ood_threshold']})")
        print(f"  ├─ Top-3 ──────────────────────────────────────────────")
        for i, t in enumerate(d["top3"], 1):
            bar = "█" * int(t["confidence"] * 30)
            print(f"  │  {i}. {t['class']:<45} {t['confidence']:>6.1%}  {bar}")
        if d.get("sim_scores"):
            print(f"  ├─ Similarity to each class ───────────────────────────")
            for cls, sim in sorted(d["sim_scores"].items(), key=lambda x: x[1], reverse=True):
                bar = "█" * int(max(0, sim) * 30)
                print(f"  │  {cls:<45} {sim:>6.4f}  {bar}")
        print(f"  └──────────────────────────────────────────────────────")

    elif d["status"] == "clear_skin":
        print(f"\n  Mask ratio : {d['mask_ratio']:.4%}")
    elif d["status"] == "rejected":
        print(f"\n  Skin conf  : {d['skin_conf']:.1%}")


# ── main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Test the skin-lesion pipeline on one or more images.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--image",  type=str, help="Path to a single image file.")
    group.add_argument("--folder", type=str, help="Path to a folder of images.")

    parser.add_argument("--s1",        type=str, default=STAGE1_CKPT)
    parser.add_argument("--s2",        type=str, default=STAGE2_CKPT)
    parser.add_argument("--s3",        type=str, default=STAGE3_CKPT)
    parser.add_argument("--ood-calib", type=str, default=OOD_CALIB)
    parser.add_argument("--threshold", type=float, default=MASK_THRESHOLD)
    parser.add_argument("--device",    type=str, default=DEVICE)
    parser.add_argument("--debug",     action="store_true")
    parser.add_argument("--save-dir",  type=str, default="pipeline_outputs")
    parser.add_argument("--json-out",  type=str, default=None)
    parser.add_argument("--class-map", type=str, default=None)

    args = parser.parse_args()

    class_names = None
    if args.class_map:
        with open(args.class_map) as f:
            idx_to_class = json.load(f)
        class_names = [idx_to_class[str(i)] for i in range(len(idx_to_class))]

    pipeline = SkinPipeline(
        stage1_ckpt          = args.s1,
        stage2_ckpt          = args.s2,
        stage3_ckpt          = args.s3,
        ood_calibration_path = args.ood_calib,
        mask_ratio_threshold = args.threshold,
        class_names          = class_names,
        device               = args.device,
        debug                = args.debug,
    )

    image_paths = collect_images(args.image or args.folder)
    if not image_paths:
        print("[ERROR] No images found.")
        sys.exit(1)
    print(f"\n[Test] Found {len(image_paths)} image(s).")

    all_results   = []
    total_times   = []
    status_counts = {"rejected": 0, "clear_skin": 0,
                     "lesion_detected": 0, "unknown_condition": 0}

    for img_path in image_paths:
        img_bgr = cv2.imread(img_path)
        if img_bgr is None:
            print(f"[WARN] Cannot read {img_path}, skipping.")
            continue

        t0      = time.perf_counter()
        result  = pipeline.predict(img_bgr)
        elapsed = (time.perf_counter() - t0) * 1000

        total_times.append(elapsed)
        status_counts[result.status] += 1
        print_result(img_path, result, elapsed)

        if args.debug:
            save_debug_images(img_bgr, result, args.save_dir, Path(img_path).stem)

        all_results.append({
            "image":   img_path,
            "time_ms": round(elapsed, 2),
            **result.to_dict(),
        })

    n = len(total_times)
    if n > 0:
        print(f"\n{'='*60}")
        print(f"  SUMMARY  ({n} image{'s' if n > 1 else ''})")
        print(f"{'='*60}")
        print(f"  Rejected      : {status_counts['rejected']}")
        print(f"  Clear skin    : {status_counts['clear_skin']}")
        print(f"  Lesion found  : {status_counts['lesion_detected']}")
        print(f"  Unknown (OOD) : {status_counts['unknown_condition']}")
        print(f"\n  Avg latency   : {sum(total_times)/n:.1f} ms")
        print(f"  Min / Max     : {min(total_times):.1f} ms / {max(total_times):.1f} ms")
        print(f"{'='*60}")

    if args.json_out:
        with open(args.json_out, "w") as f:
            json.dump(all_results, f, indent=2)
        print(f"\n[Output] Results written → {args.json_out}")


if __name__ == "__main__":
    main_path = os.getcwd()
    sys.argv = [
        "test_pipeline.py",
        "--image", rf"{main_path}\images\sk.png",
    ]
    main()
