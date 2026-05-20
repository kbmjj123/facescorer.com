# ONNX Model Files

Place the following ONNX model files in this directory:

| File | Size | Purpose |
|------|------|---------|
| `text_detection_db.onnx` | ~17MB | DB text detection model |
| `text_recognition_crnn_ch.onnx` | ~10MB | CRNN text recognition model (Chinese + English) |

## Download

Clone from opencv_zoo and copy the models:

```bash
git clone https://github.com/opencv/opencv_zoo --depth 1
# DB model
cp opencv_zoo/models/text_detection_db/text_detection_db_ic15_resnet18_2021sep.onnx public/models/text_detection_db.onnx
# CRNN model
cp opencv_zoo/models/text_recognition_crnn/text_recognition_CRNN_CH_2021sep.onnx public/models/text_recognition_crnn_ch.onnx
```

These files are excluded from git due to size (~27MB total).
They are deployed to Cloudflare CDN alongside the static site.
