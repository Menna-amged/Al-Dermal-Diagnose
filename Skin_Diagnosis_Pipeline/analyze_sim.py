"""
analyze_sim.py
──────────────
Runs the full pipeline on test set and reports:
  1. Bottom 10 known images by lowest similarity (at risk of wrong OOD flag)
  2. Top 20 unknown images by highest similarity (at risk of slipping through)

Paths loaded from .env via config.py.

Run
───
python analyze_sim.py --known path/to/known --unknown path/to/unknown
"""

import argparse
import os
import sys
from pathlib import Path

import cv2

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prediction import SkinPipeline
from config import STAGE1_CKPT, STAGE2_CKPT, STAGE3_CKPT, OOD_CALIB, MASK_THRESHOLD, DEVICE

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}


def collect_images(folder):
    images = []
    for root, _, files in os.walk(folder):
        for f in sorted(files):
            if Path(f).suffix.lower() in IMAGE_EXTS:
                rel   = os.path.relpath(root, folder)
                label = rel if rel != "." else "unknown"
                images.append((os.path.join(root, f), label))
    return images


def run_analysis(pipeline, image_list):
    results = []
    total   = len(image_list)
    for i, (img_path, label) in enumerate(image_list, 1):
        print(f"  [{i:>4}/{total}] {Path(img_path).name}", end="\r")
        img_bgr = cv2.imread(img_path)
        if img_bgr is None:
            continue
        result = pipeline.predict(img_bgr)
        d      = result.to_dict()
        results.append({
            "path":       img_path,
            "label":      label,
            "status":     d["status"],
            "best_sim":   d.get("best_sim"),
            "confidence": d.get("confidence"),
            "predicted":  d.get("predicted_class"),
            "ood_reason": d.get("ood_reason"),
        })
    print()
    return results


def main():
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("--known",       required=True,
                        help="Folder of known disease test images (subfolders = class names).")
    parser.add_argument("--unknown",     required=True,
                        help="Folder of unknown/OOD test images.")
    parser.add_argument("--top-known",   type=int, default=10)
    parser.add_argument("--top-unknown", type=int, default=20)
    args = parser.parse_args()

    pipeline = SkinPipeline(
        stage1_ckpt          = STAGE1_CKPT,
        stage2_ckpt          = STAGE2_CKPT,
        stage3_ckpt          = STAGE3_CKPT,
        ood_calibration_path = OOD_CALIB,
        mask_ratio_threshold = MASK_THRESHOLD,
        device               = DEVICE,
        debug                = False,
    )
    sim_threshold = pipeline.stage3._sim_threshold

    known_images   = collect_images(args.known)
    unknown_images = collect_images(args.unknown)
    print(f"\nKnown images   : {len(known_images)}")
    print(f"Unknown images : {len(unknown_images)}")

    # ── Known ─────────────────────────────────────────────────────────────────
    print(f"\n{'─'*70}\n  Running on KNOWN disease images...\n{'─'*70}")
    known_results  = run_analysis(pipeline, known_images)
    known_with_sim = sorted([r for r in known_results if r["best_sim"] is not None],
                             key=lambda x: x["best_sim"])

    print(f"\n{'='*70}")
    print(f"  BOTTOM {args.top_known} KNOWN images by similarity  (threshold={sim_threshold})")
    print(f"{'='*70}")
    print(f"  {'Sim':>7}  {'Conf':>6}  {'True Label':<25}  {'Predicted':<25}  File")
    print(f"  {'-'*95}")
    for r in known_with_sim[:args.top_known]:
        flag = " ← WRONGLY FLAGGED" if r["status"] == "unknown_condition" else ""
        print(f"  {r['best_sim']:>7.4f}  {r['confidence']:>6.1%}  "
              f"{r['label']:<25}  {str(r['predicted'])[:25]:<25}  "
              f"{Path(r['path']).name}{flag}")

    if known_with_sim:
        sims           = [r["best_sim"] for r in known_with_sim]
        wrongly_flagged = sum(1 for r in known_with_sim if r["status"] == "unknown_condition")
        print(f"\n  Min sim : {min(sims):.4f}  |  Avg sim : {sum(sims)/len(sims):.4f}  |  Max sim : {max(sims):.4f}")
        print(f"  Wrongly flagged : {wrongly_flagged} / {len(known_with_sim)}")
        print(f"  → To protect known images, set sim_threshold BELOW {min(sims):.4f}")

    # ── Unknown ───────────────────────────────────────────────────────────────
    print(f"\n{'─'*70}\n  Running on UNKNOWN / OOD images...\n{'─'*70}")
    unknown_results  = run_analysis(pipeline, unknown_images)
    unknown_with_sim = sorted([r for r in unknown_results if r["best_sim"] is not None],
                               key=lambda x: x["best_sim"], reverse=True)

    print(f"\n{'='*70}")
    print(f"  TOP {args.top_unknown} UNKNOWN images by similarity  (threshold={sim_threshold})")
    print(f"{'='*70}")
    print(f"  {'Sim':>7}  {'Conf':>6}  {'Status':<20}  {'Predicted':<25}  File")
    print(f"  {'-'*95}")
    for r in unknown_with_sim[:args.top_unknown]:
        flag = " ← SLIPPED THROUGH" if r["status"] == "lesion_detected" else ""
        print(f"  {r['best_sim']:>7.4f}  {r['confidence']:>6.1%}  "
              f"{r['status']:<20}  {str(r['predicted'])[:25]:<25}  "
              f"{Path(r['path']).name}{flag}")

    if unknown_with_sim:
        sims    = [r["best_sim"] for r in unknown_with_sim]
        slipped = sum(1 for r in unknown_with_sim if r["status"] == "lesion_detected")
        print(f"\n  Min sim : {min(sims):.4f}  |  Avg sim : {sum(sims)/len(sims):.4f}  |  Max sim : {max(sims):.4f}")
        print(f"  Slipped through : {slipped} / {len(unknown_with_sim)}")
        print(f"  → To catch unknowns, set sim_threshold ABOVE {max(sims):.4f}")

    # ── Suggestion ────────────────────────────────────────────────────────────
    if known_with_sim and unknown_with_sim:
        known_min   = min(r["best_sim"] for r in known_with_sim)
        unknown_max = max(r["best_sim"] for r in unknown_with_sim)
        print(f"\n{'='*70}")
        print(f"  THRESHOLD SUGGESTION")
        print(f"{'='*70}")
        print(f"  Lowest sim in known   : {known_min:.4f}")
        print(f"  Highest sim in unknown: {unknown_max:.4f}")
        if unknown_max < known_min:
            midpoint = (known_min + unknown_max) / 2
            print(f"  ✅ Clean separation! Suggested threshold: {midpoint:.4f}")
        else:
            overlap = unknown_max - known_min
            print(f"  ⚠️  Overlap of {overlap:.4f} — no perfect threshold exists.")
            print(f"     Try {known_min - 0.01:.4f} to protect known images")
            print(f"     or  {unknown_max + 0.01:.4f} to catch all unknowns")
        print(f"{'='*70}")


if __name__ == "__main__":
    main_path = os.getcwd()
    sys.argv = [
        "analyze_sim.py",
        "--known",   rf"F:\BNU\fourth year\Graduation Project\classififaction model\dataset\fine-tune_similarity\known",
        "--unknown", rf"F:\BNU\fourth year\Graduation Project\classififaction model\dataset\fine-tune_similarity\Unknown",
    ]
    main()
