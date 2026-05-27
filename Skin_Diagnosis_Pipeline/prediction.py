"""
prediction.py
─────────────
Pipeline orchestrator — loads all three models once and runs the full pipeline.

Stages
──────
  1. Stage 1 (MobileNetV3-Small)  — skin vs irrelevant filter
  2. Stage 2 (SwinV2-Base UNet)   — lesion segmentation + post-processing
  3. Stage 3 (ConvNeXt-Small 6ch) — 8-class disease classifier + OOD detection

Status values returned
──────────────────────
  "rejected"          — Stage 1: not a person's skin image
  "clear_skin"        — Stage 2: mask coverage below threshold
  "lesion_detected"   — Stage 3: known disease predicted
  "unknown_condition" — Stage 3: OOD detected (unknown disease)
"""

from __future__ import annotations

import numpy as np
from dataclasses import dataclass, field
from typing import Optional

from stage1_filter   import Stage1Filter
from stage2_seg      import Stage2Segmenter
from stage3_classify import Stage3Classifier, UNKNOWN_LABEL


@dataclass
class PipelineResult:
    # Stage 1
    is_skin:   bool  = False
    skin_conf: float = 0.0

    # Stage 2
    is_lesion:  bool  = False
    mask_ratio: float = 0.0

    # Stage 3 — classification
    predicted_class: str   = ""
    predicted_idx:   int   = -1
    confidence:      float = 0.0
    top2_gap:        float = 0.0
    top3:            list  = field(default_factory=list)
    probabilities:   dict  = field(default_factory=dict)

    # Stage 3 — OOD
    is_unknown:    bool            = False
    ood_reason:    Optional[str]   = None
    ood_energy:    Optional[float] = None
    ood_threshold: Optional[float] = None
    best_sim:      Optional[float] = None
    sim_threshold: Optional[float] = None
    sim_scores:    Optional[dict]  = None

    # Summary
    status:  str = ""
    message: str = ""

    # Debug images (populated when debug=True)
    debug: Optional[dict] = None

    def to_dict(self) -> dict:
        return {
            "status":          self.status,
            "message":         self.message,
            "is_skin":         self.is_skin,
            "skin_conf":       round(self.skin_conf, 4),
            "is_lesion":       self.is_lesion,
            "mask_ratio":      round(self.mask_ratio, 4),
            "predicted_class": self.predicted_class,
            "predicted_idx":   self.predicted_idx,
            "confidence":      round(self.confidence, 4),
            "top2_gap":        round(self.top2_gap, 4),
            "is_unknown":      self.is_unknown,
            "ood_reason":      self.ood_reason,
            "ood_energy":      round(self.ood_energy, 4)    if self.ood_energy    is not None else None,
            "ood_threshold":   round(self.ood_threshold, 4) if self.ood_threshold is not None else None,
            "best_sim":        round(self.best_sim, 4)      if self.best_sim      is not None else None,
            "sim_threshold":   self.sim_threshold,
            "sim_scores":      self.sim_scores,
            "top3":            [
                {"class": t["class"], "confidence": round(t["confidence"], 4)}
                for t in self.top3
            ],
            "probabilities":   {k: round(v, 4) for k, v in self.probabilities.items()},
        }


class SkinPipeline:
    """
    Parameters
    ----------
    stage1_ckpt          : Stage 1 MobileNetV3-Small checkpoint path.
    stage2_ckpt          : Stage 2 SwinV2-Base UNet checkpoint path.
    stage3_ckpt          : Stage 3 ConvNeXt-Small checkpoint path.
    ood_calibration_path : OOD calibration JSON path (from calibrate_ood.py).
    mask_ratio_threshold : Lesion pixel fraction to call "lesion" (default 0.05).
    class_names          : Optional ordered list of 8 class names.
    device               : 'cuda' | 'cpu' | None (auto-detect).
    debug                : Attach intermediate images to PipelineResult.debug.
    """

    def __init__(
        self,
        stage1_ckpt:          str,
        stage2_ckpt:          str,
        stage3_ckpt:          str,
        ood_calibration_path: Optional[str] = None,
        mask_ratio_threshold: float          = 0.05,
        class_names:          list           = None,
        device=None,
        debug: bool = False,
    ):
        import torch
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"

        print(f"[Pipeline] Loading Stage 1 (MobileNetV3-Small) on {device}...")
        self.stage1 = Stage1Filter(stage1_ckpt, device=device)

        print(f"[Pipeline] Loading Stage 2 (SwinV2-Base UNet) on {device}...")
        self.stage2 = Stage2Segmenter(
            stage2_ckpt,
            mask_ratio_threshold=mask_ratio_threshold,
            device=device,
        )

        print(f"[Pipeline] Loading Stage 3 (ConvNeXt-Small 6ch) on {device}...")
        self.stage3 = Stage3Classifier(
            stage3_ckpt,
            class_names          = class_names,
            ood_calibration_path = ood_calibration_path,
            device               = device,
        )

        self.debug = debug
        ood_status = "ENABLED" if self.stage3.ood_enabled else "disabled (no calibration)"
        print(f"[Pipeline] All models loaded. OOD detection: {ood_status}")

    def predict(self, img_bgr: np.ndarray) -> PipelineResult:
        result = PipelineResult()

        # ── Stage 1 ───────────────────────────────────────────────────────────
        s1 = self.stage1.predict(img_bgr)
        result.is_skin   = s1["is_skin"]
        result.skin_conf = s1["skin_conf"]

        if not result.is_skin:
            result.status  = "rejected"
            result.message = (
                f"Image rejected: not a person's skin image "
                f"(confidence={s1['skin_conf']:.1%}, label='{s1['label']}')."
            )
            return result

        # ── Stage 2 ───────────────────────────────────────────────────────────
        s2 = self.stage2.predict(img_bgr)
        result.is_lesion  = s2["is_lesion"]
        result.mask_ratio = s2["mask_ratio"]

        if not result.is_lesion:
            result.status  = "clear_skin"
            result.message = (
                f"No lesion detected. Mask coverage = {s2['mask_ratio']:.2%} "
                f"(threshold = {self.stage2.mask_ratio_threshold:.0%})."
            )
            if self.debug:
                result.debug = self._pack_debug(s2)
            return result

        # ── Stage 3 ───────────────────────────────────────────────────────────
        s3 = self.stage3.predict(
            skin_masked_bgr = s2["skin_masked_bgr"],
            enhanced_bgr    = s2["enhanced_bgr"],
        )

        result.predicted_class = s3["predicted_class"]
        result.predicted_idx   = s3["predicted_idx"]
        result.confidence      = s3["confidence"]
        result.top2_gap        = s3["top2_gap"]
        result.top3            = s3["top3"]
        result.probabilities   = s3["probabilities"]
        result.is_unknown      = s3["is_unknown"]
        result.ood_reason      = s3["ood_reason"]
        result.ood_energy      = s3["ood_energy"]
        result.ood_threshold   = s3["ood_threshold"]
        result.best_sim        = s3["best_sim"]
        result.sim_threshold   = s3["sim_threshold"]
        result.sim_scores      = s3["sim_scores"]

        if result.is_unknown:
            result.status  = "unknown_condition"
            result.message = (
                f"Unknown condition detected. "
                f"Reason: {s3['ood_reason']}. "
                f"Please consult a doctor."
            )
        else:
            result.status  = "lesion_detected"
            result.message = (
                f"Lesion detected ({result.mask_ratio:.2%} coverage). "
                f"Predicted: '{result.predicted_class}' "
                f"(confidence={result.confidence:.1%}, "
                f"similarity={result.best_sim:.4f})."
                if result.best_sim is not None else
                f"Lesion detected ({result.mask_ratio:.2%} coverage). "
                f"Predicted: '{result.predicted_class}' "
                f"(confidence={result.confidence:.1%})."
            )

        if self.debug:
            result.debug = self._pack_debug(s2)

        return result

    @staticmethod
    def _pack_debug(s2: dict) -> dict:
        return {
            "mask_bin":        s2["mask_bin"],
            "masked_bgr":      s2["masked_bgr"],
            "skin_masked_bgr": s2["skin_masked_bgr"],
            "enhanced_bgr":    s2["enhanced_bgr"],
        }
