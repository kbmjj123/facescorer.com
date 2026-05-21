import { ref, readonly } from 'vue'
import type { FaceLandmarker, FaceLandmarkerResult, FilesetResolver } from '@mediapipe/tasks-vision'

let TasksVision: { FilesetResolver: typeof FilesetResolver; FaceLandmarker: typeof FaceLandmarker } | null = null

export function useFaceLandmarker() {
  const isReady = ref(false)
  const loadProgress = ref(0)
  const error = ref<string | null>(null)

  let landmarker: FaceLandmarker | null = null
  let loading = false

  async function init() {
    if (loading || isReady.value) return
    loading = true
    error.value = null
    loadProgress.value = 5

    try {
      // Dynamic import
      const mod = await import('@mediapipe/tasks-vision')
      TasksVision = mod
      loadProgress.value = 15

      const vision = await mod.FilesetResolver.forVisionTasks('/wasm')
      loadProgress.value = 40

      landmarker = await mod.FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/wasm/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
        runningMode: 'IMAGE',
        numFaces: 1,
      })

      loadProgress.value = 100
      isReady.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Model failed to load, please refresh'
      console.error('MediaPipe init failed:', e)
    } finally {
      loading = false
    }
  }

  // Start loading immediately
  if (typeof window !== 'undefined') {
    init()
  }

  async function detect(imageElement: HTMLImageElement): Promise<FaceLandmarkerResult> {
    if (!landmarker) throw new Error('Face landmarker not initialized')

    const result = landmarker.detect(imageElement)
    return result
  }

  return {
    isReady: readonly(isReady),
    loadProgress: readonly(loadProgress),
    error: readonly(error),
    detect,
    init,
  }
}
