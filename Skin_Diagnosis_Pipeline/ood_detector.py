"""
ood_detector.py
───────────────
Out-of-Distribution (OOD) detection for Stage 3 using the Energy Score method
with Temperature Scaling calibration.

Theory
──────
Standard softmax is overconfident on OOD inputs — it always sums to 1.0 even
for images the model has never seen.  Two fixes applied here:

1. Temperature Scaling (Guo et al. 2017)
   Divides logits by a scalar T > 1 before softmax, spreading probability mass
   and making the model more honest about uncertainty.  T is fitted on the
   validation set by minimising Negative Log Likelihood (NLL) — no retraining.

2. Energy Score (Liu et al. 2020 — "Energy-based Out-of-distribution Detection")
   E(x; T) = -T · log Σ_i exp(f_i(x) / T)
   In-distribution inputs produce low (negative) energy.
   OOD inputs produce high (less negative) energy.
   This is strictly more powerful than Max Softmax Probability (MSP) because it
   uses the full logit vector, not just the winning class.

Calibration workflow (run once after training)
──────────────────────────────────────────────
  from ood_detector import OODDetector
  detector = OODDetector(stage3_model, device)

  # 1. Fit temperature on your validation set (in-distribution)
  detector.fit_temperature(val_loader)          # adjusts self.temperature

  # 2. Compute energy threshold on the same validation set
  #    Use a high percentile (e.g. 5th percentile of in-dist energy) so that
  #    ~95 % of real in-dist images pass.
  detector.fit_threshold(val_loader, fpr=0.05)  # saves self.threshold

  # 3. Save calibration so you don't rerun it every time
  detector.save_calibration("checkpoints/ood_calibration.json")

Inference (used by Stage 3 at prediction time)
───────────────────────────────────────────────
  result = detector.score(logits_tensor)
  # result = {"is_ood": bool, "energy": float, "temperature": float,
  #           "threshold": float, "confidence": float}

References
──────────
  Liu et al. 2020 — https://arxiv.org/abs/2010.03759
  Guo et al. 2017 — https://arxiv.org/abs/1706.04599
"""

from __future__ import annotations

import json
import os
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from tqdm import tqdm


class OODDetector:
    """
    Energy-based OOD detector with temperature scaling.

    Parameters
    ----------
    model       : The trained Stage 3 ConvNeXt model (nn.Module).
    device      : torch.device or str.
    temperature : Initial temperature T (refined by fit_temperature).
    threshold   : Energy threshold below which input is in-distribution.
                  Set manually or fitted via fit_threshold().
    """

    def __init__(
        self,
        model:       nn.Module,
        device,
        temperature: float = 1.0,
        threshold:   Optional[float] = None,
    ):
        self.model       = model
        self.device      = torch.device(device)
        self.temperature = temperature
        self.threshold   = threshold   # None until fitted or loaded

    # ── Core energy formula ───────────────────────────────────────────────────
    def energy(self, logits: torch.Tensor) -> torch.Tensor:
        """
        Compute energy score for a batch of logits.

        E(x; T) = -T · log Σ_i exp(f_i / T)

        Lower (more negative) = more in-distribution.
        Higher (less negative) = more out-of-distribution.

        Parameters
        ----------
        logits : (B, C) raw model output (before softmax).

        Returns
        -------
        (B,) energy scores.
        """
        return -self.temperature * torch.logsumexp(
            logits / self.temperature, dim=1
        )

    # ── Decision ──────────────────────────────────────────────────────────────
    def score(self, logits: torch.Tensor) -> dict:
        """
        Decide in-distribution vs. OOD for a single-sample logit tensor.

        Parameters
        ----------
        logits : (1, C) or (C,) raw logits from Stage 3.

        Returns
        -------
        dict:
            is_ood      (bool)  – True if OOD / unknown condition
            energy      (float) – Raw energy score (less negative = more OOD)
            threshold   (float) – The fitted threshold
            temperature (float) – Calibrated temperature
            confidence  (float) – Max calibrated softmax probability
        """
        if self.threshold is None:
            raise RuntimeError(
                "OODDetector has no threshold. "
                "Call fit_threshold() or load_calibration() first."
            )

        logits = logits.view(1, -1).to(self.device)

        e    = self.energy(logits).item()
        prob = F.softmax(logits / self.temperature, dim=1)
        conf = float(prob.max().item())

        return {
            "is_ood":      e < self.threshold,
            "energy":      round(e, 4),
            "threshold":   round(self.threshold, 4),
            "temperature": round(self.temperature, 4),
            "confidence":  round(conf, 4),
        }

    # ── Temperature calibration ───────────────────────────────────────────────
    @torch.no_grad()
    def fit_temperature(
        self,
        val_loader: DataLoader,
        lr:         float = 0.01,
        max_iter:   int   = 50,
        verbose:    bool  = True,
    ) -> float:
        """
        Fit a scalar temperature on the validation set by minimising NLL
        (Platt / Guo 2017 temperature scaling).

        Requires the val_loader to yield (inputs, labels) where inputs are
        already the 6-channel tensors used during training.

        Returns the fitted temperature.
        """
        self.model.eval()

        # Collect all logits and labels from the val set
        all_logits, all_labels = [], []
        for batch in tqdm(val_loader, desc="[OOD] Collecting val logits",
                          disable=not verbose):
            inputs, labels = batch[0].to(self.device), batch[1]
            logits = self.model(inputs)
            all_logits.append(logits.detach().cpu())
            all_labels.append(labels)

        all_logits = torch.cat(all_logits)   # (N, C)
        all_labels = torch.cat(all_labels)   # (N,)

        # Optimise temperature (single scalar)
        temperature = nn.Parameter(
            torch.ones(1, device="cpu") * self.temperature
        )
        optimizer = torch.optim.LBFGS(
            [temperature], lr=lr, max_iter=max_iter
        )
        criterion = nn.CrossEntropyLoss()

        def eval_nll():
            optimizer.zero_grad()
            scaled_logits = all_logits / temperature.clamp(min=1e-3)
            loss = criterion(scaled_logits, all_labels)
            loss.backward()
            return loss

        optimizer.step(eval_nll)

        fitted_T = float(temperature.clamp(min=1e-3).item())
        self.temperature = fitted_T

        if verbose:
            print(f"[OOD] Temperature fitted: T = {fitted_T:.4f}")

        return fitted_T

    # ── Threshold calibration ─────────────────────────────────────────────────
    @torch.no_grad()
    def fit_threshold(
        self,
        val_loader:  DataLoader,
        fpr:         float = 0.05,
        verbose:     bool  = True,
    ) -> float:
        """
        Set the energy threshold as the (fpr * 100)-th percentile of in-
        distribution energy scores on the validation set.

        fpr = 0.05 means: allow at most 5 % of real in-dist images to be
        flagged as OOD (False Positive Rate on in-distribution data).

        The higher fpr → tighter threshold → more images flagged as OOD.
        The lower  fpr → looser threshold → fewer real images rejected.

        Recommended starting point: fpr=0.05 (95 % of val set passes).

        Returns the threshold value.
        """
        self.model.eval()

        energies = []
        for batch in tqdm(val_loader, desc="[OOD] Computing val energies",
                          disable=not verbose):
            inputs = batch[0].to(self.device)
            logits = self.model(inputs)
            e      = self.energy(logits)
            energies.extend(e.cpu().tolist())

        energies   = np.array(energies)
        # fpr = fraction of in-dist we allow to be *above* the threshold
        # so threshold = (1 - fpr) percentile of in-dist energies
        percentile = (1.0 - fpr) * 100.0
        threshold  = float(np.percentile(energies, percentile))
        self.threshold = threshold

        if verbose:
            print(f"[OOD] Energy stats on val set:")
            print(f"      mean   = {energies.mean():.4f}")
            print(f"      std    = {energies.std():.4f}")
            print(f"      min    = {energies.min():.4f}")
            print(f"      max    = {energies.max():.4f}")
            print(f"      p{percentile:.0f}  = {threshold:.4f}  ← threshold (FPR={fpr:.0%})")

        return threshold

    # ── Calibration I/O ───────────────────────────────────────────────────────
    def save_calibration(self, path: str):
        """Save temperature and threshold to a JSON file."""
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        data = {
            "temperature": self.temperature,
            "threshold":   self.threshold,
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"[OOD] Calibration saved → {path}")

    def load_calibration(self, path: str):
        """Load temperature and threshold from a previously saved JSON file."""
        with open(path) as f:
            data = json.load(f)
        self.temperature = float(data["temperature"])
        self.threshold   = float(data["threshold"])
        print(f"[OOD] Calibration loaded from {path}")
        print(f"      temperature = {self.temperature:.4f}")
        print(f"      threshold   = {self.threshold:.4f}")

    def __repr__(self):
        return (
            f"OODDetector("
            f"temperature={self.temperature:.4f}, "
            f"threshold={self.threshold})"
        )
