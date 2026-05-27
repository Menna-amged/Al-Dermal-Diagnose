"""
utils.py
────────
Shared helpers used by the pipeline and FastAPI layer.

Includes:
  - load_image_bgr()      — robust image loading from file path or raw bytes
  - encode_image_base64() — encode a BGR ndarray to base64 PNG/JPEG string
  - draw_overlay()        — draw a green mask overlay with red contours
  - result_to_response()  — convert PipelineResult to a FastAPI-ready dict,
                             optionally embedding debug images as base64
"""

import base64
import io
from typing import Optional

import cv2
import numpy as np


# ── Image I/O ─────────────────────────────────────────────────────────────────
def load_image_bgr(source) -> Optional[np.ndarray]:
    """
    Load a BGR image from:
      - a file path (str or Path)
      - raw bytes (from an HTTP upload or file.read())
      - a numpy ndarray (returned as-is)

    Returns None if the image cannot be decoded.
    """
    if isinstance(source, np.ndarray):
        return source
    if isinstance(source, (bytes, bytearray)):
        arr = np.frombuffer(source, dtype=np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)
    # file path
    return cv2.imread(str(source))


def encode_image_base64(img_bgr: np.ndarray, fmt: str = ".jpg", quality: int = 90) -> str:
    """
    Encode a BGR ndarray to a base64 string.

    Parameters
    ----------
    img_bgr  : BGR uint8 ndarray
    fmt      : '.jpg' or '.png'
    quality  : JPEG quality (ignored for PNG)

    Returns
    -------
    Base64-encoded string (no data-URI prefix).
    """
    params = [cv2.IMWRITE_JPEG_QUALITY, quality] if fmt == ".jpg" else []
    ok, buf = cv2.imencode(fmt, img_bgr, params)
    if not ok:
        raise ValueError(f"cv2.imencode failed for format '{fmt}'")
    return base64.b64encode(buf).decode("utf-8")


# ── Visual helpers ─────────────────────────────────────────────────────────────
def draw_overlay(
    img_bgr: np.ndarray,
    mask_bin: np.ndarray,
    alpha: float = 0.35,
    overlay_color: tuple = (0, 255, 0),   # BGR green fill
    contour_color: tuple = (0, 0, 255),   # BGR red contour
    contour_thickness: int = 2,
) -> np.ndarray:
    """
    Blend a semi-transparent coloured mask over the image and draw contours.

    Parameters
    ----------
    img_bgr       : Original BGR image.
    mask_bin      : Binary mask (H×W uint8, 255 = lesion).
    alpha         : Opacity of the coloured fill (0 = invisible, 1 = solid).
    overlay_color : BGR colour for the mask fill.
    contour_color : BGR colour for the contour lines.

    Returns
    -------
    BGR image with overlay drawn in-place on a copy.
    """
    overlay      = img_bgr.copy()
    colour_layer = np.zeros_like(img_bgr)
    colour_layer[mask_bin > 0] = overlay_color
    overlay = cv2.addWeighted(overlay, 1.0, colour_layer, alpha, 0)
    contours, _ = cv2.findContours(mask_bin, cv2.RETR_EXTERNAL,
                                    cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(overlay, contours, -1, contour_color, contour_thickness)
    return overlay


# ── Response builder ──────────────────────────────────────────────────────────
def result_to_response(
    result,                          # PipelineResult from prediction.py
    img_bgr: np.ndarray,
    include_debug_images: bool = False,
) -> dict:
    """
    Convert a PipelineResult into a fully JSON-serialisable dict for FastAPI.

    When include_debug_images=True, the following base64-encoded images are
    added under the "images" key (only when debug data is available):
      - overlay        : green mask + red contour over original image
      - mask           : binary segmentation mask (grayscale)
      - skin_masked    : YCrCb-masked original (Branch A for Stage 3)
      - enhanced       : lesion-upscaled masked image (Branch B for Stage 3)

    The images are encoded as JPEG (overlay, skin_masked, enhanced) or PNG
    (mask) and wrapped in base64 strings ready for:
      data:image/jpeg;base64,<string>
      data:image/png;base64,<string>
    """
    response = result.to_dict()

    if include_debug_images and result.debug is not None:
        d = result.debug
        images = {}

        try:
            images["overlay"] = (
                "data:image/jpeg;base64,"
                + encode_image_base64(draw_overlay(img_bgr, d["mask_bin"]), ".jpg")
            )
        except Exception:
            pass

        try:
            images["mask"] = (
                "data:image/png;base64,"
                + encode_image_base64(d["mask_bin"], ".png")
            )
        except Exception:
            pass

        try:
            images["skin_masked"] = (
                "data:image/jpeg;base64,"
                + encode_image_base64(d["skin_masked_bgr"], ".jpg")
            )
        except Exception:
            pass

        try:
            images["enhanced"] = (
                "data:image/jpeg;base64,"
                + encode_image_base64(d["enhanced_bgr"], ".jpg")
            )
        except Exception:
            pass

        response["images"] = images

    return response
