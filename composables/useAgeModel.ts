import { ref, readonly } from 'vue'

export function useAgeModel() {
  const isReady = ref(false)
  const loading = ref(false)

  // Load model when called (only on /age page)
  async function init() {
    if (isReady.value || loading.value) return
    loading.value = true

    // TODO: Replace with real ONNX age model loading
    // const ort = await import('onnxruntime-web')
    // ort.env.wasm.wasmPaths = '/wasm/'
    // const buffer = await fetchWithCache('/models/age_estimation.onnx')
    // session = await ort.InferenceSession.create(buffer, { executionProviders: ['wasm'] })
    await new Promise((r) => setTimeout(r, 600))
    isReady.value = true
    loading.value = false
  }

  // Start loading immediately
  if (typeof window !== 'undefined') {
    init()
  }

  // Detect age from face crop
  // TODO: Replace with real ONNX inference
  async function detect(_imageData: ImageData): Promise<{ age: number }> {
    if (!isReady.value) await init()

    // Mock: generate plausible age
    const mockAge = Math.round(18 + Math.random() * 27)
    return { age: mockAge }
  }

  return {
    isReady: readonly(isReady),
    detect,
    init,
  }
}
