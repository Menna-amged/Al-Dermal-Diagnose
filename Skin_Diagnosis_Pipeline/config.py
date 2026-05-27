"""
config.py
─────────
Central configuration — reads all paths and hyperparameters from .env file.
Import from this file in every other script instead of hardcoding paths.

Usage
─────
from config import STAGE1_CKPT, STAGE2_CKPT, STAGE3_CKPT, OOD_CALIB, DEVICE
"""

import os
import torch
from dotenv import load_dotenv

# Load .env from the same folder as this file
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# ── Model checkpoints ─────────────────────────────────────────────────────────
STAGE1_CKPT = os.getenv("STAGE1_CKPT")
STAGE2_CKPT = os.getenv("STAGE2_CKPT")
STAGE3_CKPT = os.getenv("STAGE3_CKPT")
OOD_CALIB   = os.getenv("OOD_CALIB")

# ── Dataset paths (used by calibrate_ood.py and build_prototypes.py) ─────────
SKIN_ROOT      = os.getenv("SKIN_ROOT")
ENHANCED_ROOT  = os.getenv("ENHANCED_ROOT")
PROTOTYPES_OUT = os.getenv("PROTOTYPES_OUT")

# ── Pipeline settings ─────────────────────────────────────────────────────────
MASK_THRESHOLD = float(os.getenv("MASK_THRESHOLD", "0.03"))

# Auto-detect device — use CUDA if available, else CPU
# Can be overridden in .env with DEVICE=cpu or DEVICE=cuda
_device_env = os.getenv("DEVICE", "auto").lower()
if _device_env == "auto":
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
else:
    DEVICE = _device_env

print(f"[Config] Device : {DEVICE}")
print(f"[Config] Stage1 : {STAGE1_CKPT}")
print(f"[Config] Stage2 : {STAGE2_CKPT}")
print(f"[Config] Stage3 : {STAGE3_CKPT}")
print(f"[Config] OOD    : {OOD_CALIB}")
