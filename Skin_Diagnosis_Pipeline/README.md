# Skin Lesion Pipeline

Three-stage inference pipeline for skin-lesion detection and classification.

```
Stage 1 → Stage 2 → Stage 3
Filter     Segment   Classify
(skin?)    (lesion?) (disease)
```

## File structure

```
skin_pipeline/
├── stage1_filter.py     # MobileNetV3-Small — skin vs. irrelevant
├── stage2_seg.py        # SwinV2-Base UNet  — lesion segmentation + post-processing
├── stage3_classify.py   # ConvNeXt-Small 384 (6-ch) — 8-class disease classifier
├── prediction.py        # Orchestrator — runs all 3 stages, returns PipelineResult
├── test_pipeline.py     # CLI test tool
├── fastapi_app.py       # FastAPI server (for Node.js backend integration)
└── README.md
```

## Setup

```bash
pip install torch torchvision timm segmentation-models-pytorch \
            albumentations scikit-image scikit-learn opencv-python \
            fastapi uvicorn python-multipart
```

## Checkpoint paths

Place your trained `.pth` files in a `checkpoints/` folder (or set env vars):

| Env variable     | Default                               | Description              |
|------------------|---------------------------------------|--------------------------|
| `STAGE1_CKPT`    | `checkpoints/stage1_mobilenet.pth`    | MobileNetV3-Small filter |
| `STAGE2_CKPT`    | `checkpoints/stage2_swinunet.pth`     | SwinV2-Base UNet         |
| `STAGE3_CKPT`    | `checkpoints/stage3_convnext.pth`     | ConvNeXt-Small 6-channel |
| `MASK_THRESHOLD` | `0.05`                                | Lesion ratio threshold   |
| `DEVICE`         | auto                                  | `cuda` or `cpu`          |

## Test the pipeline from CLI

```bash
# Single image
python test_pipeline.py \
    --image patient.jpg \
    --s1 checkpoints/stage1_mobilenet.pth \
    --s2 checkpoints/stage2_swinunet.pth \
    --s3 checkpoints/stage3_convnext.pth

# Folder + save debug images
python test_pipeline.py \
    --folder test_images/ \
    --s1 checkpoints/stage1_mobilenet.pth \
    --s2 checkpoints/stage2_swinunet.pth \
    --s3 checkpoints/stage3_convnext.pth \
    --debug --save-dir outputs/ \
    --json-out results.json

# Override class names with the JSON saved during training
python test_pipeline.py ... --class-map checkpoints/class_map.json
```

## Run as FastAPI server

```bash
# Set checkpoint paths via env vars
export STAGE1_CKPT=checkpoints/stage1_mobilenet.pth
export STAGE2_CKPT=checkpoints/stage2_swinunet.pth
export STAGE3_CKPT=checkpoints/stage3_convnext.pth

uvicorn fastapi_app:app --host 0.0.0.0 --port 8000
```

## Node.js integration (Express example)

```js
const express  = require('express');
const multer   = require('multer');
const FormData = require('form-data');
const fetch    = require('node-fetch');

const app    = express();
const upload = multer({ storage: multer.memoryStorage() });

const PYTHON_API = process.env.PYTHON_API || 'http://localhost:8000';

app.post('/skin/predict', upload.single('image'), async (req, res) => {
    const form = new FormData();
    form.append('file', req.file.buffer, {
        filename:    req.file.originalname,
        contentType: req.file.mimetype,
    });

    const response = await fetch(`${PYTHON_API}/predict`, {
        method:  'POST',
        body:    form,
        headers: form.getHeaders(),
    });

    if (!response.ok) {
        const err = await response.json();
        return res.status(response.status).json(err);
    }
    const result = await response.json();
    return res.json(result);
});

app.listen(3000);
```

## Pipeline response format

```json
{
    "status":          "lesion_detected",
    "message":         "Lesion detected (12.34% coverage). Predicted: 'Acne and Rosacea' (confidence=87.7%).",
    "is_skin":         true,
    "skin_conf":       0.9812,
    "is_lesion":       true,
    "mask_ratio":      0.1234,
    "predicted_class": "Acne and Rosacea",
    "predicted_idx":   0,
    "confidence":      0.8765,
    "top3": [
        { "class": "Acne and Rosacea", "confidence": 0.8765 },
        { "class": "Vitiligo",         "confidence": 0.0543 },
        { "class": "Chickenpox",       "confidence": 0.0321 }
    ],
    "probabilities": {
        "Acne and Rosacea": 0.8765,
        "Vitiligo": 0.0543,
        "Chickenpox": 0.0321,
        ...
    }
}
```

Possible `status` values:

| Status            | Meaning                                                  |
|-------------------|----------------------------------------------------------|
| `rejected`        | Stage 1: not a person's skin image                       |
| `clear_skin`      | Stage 2: mask coverage below threshold → no lesion found |
| `lesion_detected` | Stage 3 ran and returned a disease prediction            |

## Stage-by-stage preprocessing summary

### Stage 1 (MobileNetV3-Small)
- Resize to 224×224
- RGB, ImageNet normalisation
- Softmax over 2 classes: `irrelevent` / `person's skin`

### Stage 2 (SwinV2-Base UNet, 6-channel)
- Resize to 384×384
- Convert RGB → Lab, normalise L* to [0,1], a*/b* to [0,1]
- Concatenate RGB + Lab → 6 channels
- Normalise with ImageNet stats (RGB) + [0.5/0.5] (Lab)
- Binary mask via sigmoid ≥ 0.5; lesion if mask_ratio ≥ threshold
- Post-processing:
  - `apply_seg_mask()` — lesion pixels on gray (64,64,64) background
  - `upscale_lesions()` — enlarge small lesion blobs (≥48px side)
  - `apply_skin_mask_ycrcb()` — YCrCb skin detector on original image

### Stage 3 (ConvNeXt-Small 384, 6-channel)
- Branch A: YCrCb-masked original → resize 384×384, RGB
- Branch B: upscaled lesion image → resize 384×384, RGB
- Concatenate A+B → 6 channels, / 255, normalise with 6-ch ImageNet stats
- Softmax over 8 disease classes
