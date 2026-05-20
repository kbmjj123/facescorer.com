# ONNX Inference Rules

## Model Loading — Always Follow This Order
```ts
// 1. Check IndexedDB cache first
const cached = await getFromCache('db-model')
// 2. Only fetch from network if not cached
const buffer = cached ?? await fetchWithProgress('/models/text_detection_db.onnx', onProgress)
// 3. Cache for next visit
if (!cached) await saveToCache('db-model', buffer)
// 4. Create session
const session = await ort.InferenceSession.create(buffer, {
  executionProviders: ['wasm']  // always wasm, never webgpu/webgl in MVP
})
```

## Image Preprocessing (Canvas API)
```ts
// Always correct EXIF orientation BEFORE resizing
// DB model expects: 640x640, float32, CHW format, normalized [0,1]
// CRNN model expects: 32xW (dynamic width), float32, CHW, normalized
```

## Inference Queue Rules
- Process cards **serially** (one at a time) — parallel sessions cause OOM on mobile
- Update Pinia store status to `'processing'` before inference starts
- Update to `'done'` or `'error'` immediately after — never leave in `'processing'`
- Wrap every `session.run()` in try/catch — WASM can throw OOM errors silently

## HEIC Format Handling
```ts
// iPhone photos are often HEIC — browsers (except Safari) can't decode natively
import heic2any from 'heic2any'
if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
  const blob = await heic2any({ blob: file, toType: 'image/jpeg' })
  // proceed with jpeg blob
}
```

## Performance Expectations (document in UI)
| Device | Expected time |
|--------|--------------|
| Desktop M1/i7 | 2-4s |
| iPhone 12+ | 4-8s |
| Mid-range Android | 6-12s |

Show a progress message like "Recognizing... (~5s)" — never show a spinner with no time context.

## COOP/COEP Errors
If you see `SharedArrayBuffer is not defined` or COOP errors:
1. Verify `public/_headers` has correct COOP/COEP values
2. Cloudflare Pages deployment: confirm custom headers are deployed
3. Fallback: use single-threaded WASM (`ort-wasm.wasm` not `ort-wasm-threaded.wasm`)
