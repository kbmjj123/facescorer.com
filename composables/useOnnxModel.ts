import type { PreprocessedImage } from '~/utils/imagePreprocess'

let ort: typeof import('onnxruntime-web') | null = null

const DB_MODEL = 'text_detection_db.onnx'
const CRNN_MODEL = 'text_recognition_crnn_ch.onnx'

interface ModelState {
  dbSession: import('onnxruntime-web').InferenceSession | null
  crnnSession: import('onnxruntime-web').InferenceSession | null
  loaded: boolean
  loadProgress: number // 0-100
  loadError: string | null
}

export function useOnnxModel() {
  const state = reactive<ModelState>({
    dbSession: null,
    crnnSession: null,
    loaded: false,
    loadProgress: 0,
    loadError: null,
  })

  async function initOrt() {
    if (!ort) {
      ort = await import('onnxruntime-web')
      ort.env.wasm.wasmPaths = '/ort-wasm/'
    }
    return ort
  }

  async function loadModels(onProgress?: (pct: number) => void) {
    if (state.loaded) return
    state.loadError = null

    try {
      const ortInstance = await initOrt()
      const cache = useModelCache()

      // Load DB model
      const dbCached = await cache.getCachedModel(DB_MODEL)
      const dbBuffer = dbCached ?? await fetchWithProgress(`/models/${DB_MODEL}`, (pct) => {
        const dbPct = pct * 0.6 // DB is ~60% of total
        state.loadProgress = Math.round(dbPct)
        onProgress?.(state.loadProgress)
      })

      state.loadProgress = 60
      onProgress?.(state.loadProgress)
      state.dbSession = await ortInstance.InferenceSession.create(dbBuffer!, {
        executionProviders: ['wasm'],
      })

      if (!dbCached && dbBuffer) {
        await cache.setCachedModel(DB_MODEL, dbBuffer)
      }

      // Load CRNN model
      const crnnCached = await cache.getCachedModel(CRNN_MODEL)
      const crnnBuffer = crnnCached ?? await fetchWithProgress(`/models/${CRNN_MODEL}`, (pct) => {
        const crnnPct = 60 + pct * 0.4 // CRNN is ~40% of total
        state.loadProgress = Math.round(crnnPct)
        onProgress?.(state.loadProgress)
      })

      state.loadProgress = 100
      onProgress?.(state.loadProgress)
      state.crnnSession = await ortInstance.InferenceSession.create(crnnBuffer!, {
        executionProviders: ['wasm'],
      })

      if (!crnnCached && crnnBuffer) {
        await cache.setCachedModel(CRNN_MODEL, crnnBuffer)
      }

      state.loaded = true
    } catch (e) {
      state.loadError = e instanceof Error ? e.message : 'Unknown error loading models'
      console.error('Model load failed:', e)
    }
  }

  // Run DB text detection
  async function detectText(preprocessed: PreprocessedImage): Promise<Float32Array> {
    if (!state.dbSession || !ort) throw new Error('DB model not loaded')

    const { width, height, data } = preprocessed
    const tensor = new ort.Tensor('float32', data, [1, 3, height, width])
    const feeds: Record<string, import('onnxruntime-web').Tensor> = {}
    feeds[state.dbSession.inputNames[0]!] = tensor

    const results = await state.dbSession.run(feeds)
    const output = results[state.dbSession.outputNames[0]!]
    if (!output) throw new Error('DB model produced no output')
    return new Float32Array(output.data as Float32Array)
  }

  // Run CRNN text recognition on a cropped region
  async function recognizeText(preprocessed: PreprocessedImage): Promise<Float32Array> {
    if (!state.crnnSession || !ort) throw new Error('CRNN model not loaded')

    const { width, height, data } = preprocessed
    const tensor = new ort.Tensor('float32', data, [1, 3, height, width])
    const feeds: Record<string, import('onnxruntime-web').Tensor> = {}
    feeds[state.crnnSession.inputNames[0]!] = tensor

    const results = await state.crnnSession.run(feeds)
    const output = results[state.crnnSession.outputNames[0]!]
    if (!output) throw new Error('CRNN model produced no output')
    return new Float32Array(output.data as Float32Array)
  }

  return {
    ...toRefs(state),
    loadModels,
    detectText,
    recognizeText,
  }
}

// Utility: fetch with progress reporting via ReadableStream
async function fetchWithProgress(url: string, onProgress: (pct: number) => void): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  if (!total || !response.body) {
    return response.arrayBuffer()
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      received += value.length
      if (total > 0) onProgress(Math.round((received / total) * 100))
    }
  }

  const buffer = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
  }

  return buffer.buffer
}
