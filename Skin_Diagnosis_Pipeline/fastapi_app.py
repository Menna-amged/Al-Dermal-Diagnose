"""
fastapi_app.py
──────────────
FastAPI wrapper for the skin-lesion pipeline.
All paths and settings loaded from .env via config.py.

Run
───
uvicorn fastapi_app:app --host 0.0.0.0 --port 8000

Endpoints
─────────
POST /predict              — Predict from uploaded image.
POST /predict?images=true  — Same + base64 debug images in response.
GET  /health               — Liveness check.
GET  /classes              — List of 8 disease class names.
"""

import os
import sys

import cv2
import numpy as np
from fastapi import FastAPI, File, Query, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prediction import SkinPipeline
from utils import load_image_bgr, result_to_response
from config import STAGE1_CKPT, STAGE2_CKPT, STAGE3_CKPT, OOD_CALIB, MASK_THRESHOLD, DEVICE

# ── Load pipeline once at startup ─────────────────────────────────────────────
print("[FastAPI] Initialising pipeline...")
pipeline = SkinPipeline(
    stage1_ckpt          = STAGE1_CKPT,
    stage2_ckpt          = STAGE2_CKPT,
    stage3_ckpt          = STAGE3_CKPT,
    ood_calibration_path = OOD_CALIB,
    mask_ratio_threshold = MASK_THRESHOLD,
    device               = DEVICE,
    debug                = True,
)
print("[FastAPI] Pipeline ready.")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "Skin Lesion Pipeline API",
    description = "3-stage skin lesion detection and classification pipeline.",
    version     = "1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

ALLOWED_MIME = {
    "image/jpeg", "image/jpg", "image/png",
    "image/bmp", "image/tiff", "image/webp",
}


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "pipeline": "loaded", "device": DEVICE}


@app.get("/classes")
def get_classes():
    return {
        "classes": [
            {"idx": i, "name": name}
            for i, name in enumerate(pipeline.stage3.class_names)
        ]
    }


@app.post("/predict")
async def predict(
    file:   UploadFile = File(...),
    images: bool       = Query(False, description="Include base64 debug images in response."),
):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code = 415,
            detail      = f"Unsupported media type '{file.content_type}'. "
                          f"Accepted: {sorted(ALLOWED_MIME)}",
        )

    contents = await file.read()
    img_bgr  = load_image_bgr(contents)
    if img_bgr is None:
        raise HTTPException(status_code=422, detail="Could not decode the uploaded image.")

    # Blur detection — reject images with Laplacian variance < 50
    gray       = cv2.cvtColor(cv2.resize(img_bgr,(640,640)), cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < 1:
        raise HTTPException(
            status_code = 422,
            detail      = f"Image is too blurry (sharpness={blur_score:.1f}). Please upload a clearer photo.",
        )

    # CLAHE contrast enhancement before pipeline
    lab              = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe            = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(4, 4))
    l_ch             = clahe.apply(l_ch)
    img_bgr          = cv2.cvtColor(cv2.merge([l_ch, a_ch, b_ch]), cv2.COLOR_LAB2BGR)

    result   = pipeline.predict(img_bgr)
    response = result_to_response(result, img_bgr, include_debug_images=images)
    return JSONResponse(content=response)
