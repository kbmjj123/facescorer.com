# Model Files

FaceScorer uses two model types:

| File | Format | Size | Purpose |
|------|--------|------|---------|
| `face_landmarker.task` | MediaPipe Task | ~4MB | Face detection + 478 landmarks |
| `age_estimation.onnx` | ONNX | ~3MB | Age estimation (Age Detector page only) |

## Directory Layout

```
public/
├── wasm/
│   ├── face_landmarker.task       ← MediaPipe face model (download below)
│   ├── vision_wasm_internal.js    ← auto-copied by postinstall
│   └── vision_wasm_internal.wasm  ← auto-copied by postinstall
├── models/
│   └── age_estimation.onnx        ← ONNX age model (future, for /age page)
```

## Download

```bash
# Face landmarker model (required for Face Analyzer)
curl -o public/wasm/face_landmarker.task \
  https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task

# Age estimation model (future, for Age Detector)
# TBD
```

MediaPipe WASM runtime files (`vision_wasm_internal.*`) are automatically copied
from `node_modules/@mediapipe/tasks-vision/wasm/` via the `postinstall` script.

These files are excluded from git due to size.
They are served at runtime and cached by the browser via Cloudflare CDN.
