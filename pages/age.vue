<script setup lang="ts">
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

useHead({
  title: 'AI Age Detector — How Old Do You Look? Free Face Age Test',
  meta: [
    { name: 'description', content: 'Upload your photo and find out what age AI thinks you are. Free AI age detector — runs in your browser, photo stays private.' },
  ],
})

const { isReady: faceReady, detect: detectFace } = useFaceLandmarker()
const { isReady: ageReady, detect: detectAge } = useAgeModel()
const { get: getPhotoBus, set: setPhotoBus } = usePhotoBus()

const { t } = useI18n()

// ── Pipeline state ──
const uploadedImage = ref<string | null>(null)
const isProcessing = ref(false)
const showCanvas = ref(false)
const showResult = ref(false)
const qualityWarning = ref<string | null>(null)
const aiAge = ref<number | null>(null)
const realLandmarks = ref<Array<{ x: number; y: number }>>([])

// Check photo bus on mount
onMounted(() => {
  const bus = getPhotoBus()
  if (bus) {
    uploadedImage.value = bus.dataUrl
    // Auto-start analysis
    analyzeImage(bus.dataUrl, bus.file)
  }
})

async function handleFilesSelected(files: File[]) {
  if (files.length === 0) return
  const file = files[0]!

  if (uploadedImage.value) URL.revokeObjectURL(uploadedImage.value)
  const url = URL.createObjectURL(file)
  uploadedImage.value = url
  setPhotoBus(file, url)

  await analyzeImage(url, file)
}

async function analyzeImage(_url: string, file: File) {
  isProcessing.value = true
  qualityWarning.value = null
  showCanvas.value = false
  showResult.value = false
  aiAge.value = null

  try {
    let imageFile: Blob = file
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      const heic2any = (await import('heic2any')).default
      imageFile = await heic2any({ blob: file, toType: 'image/jpeg' }) as Blob
    }

    const img = await loadImageElement(URL.createObjectURL(imageFile))

    // Face detection for landmarks (shared with FaceCanvas)
    if (!faceReady.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(faceReady, (v) => { if (v) { stop(); resolve() } })
      })
    }

    const faceResult = await detectFace(img)
    if (!faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) {
      qualityWarning.value = 'Please upload a clear front-facing photo'
      isProcessing.value = false
      return
    }

    const lm = faceResult.faceLandmarks[0]!
    realLandmarks.value = lm.map((l: NormalizedLandmark) => ({ x: l.x, y: l.y }))

    // Age detection
    if (!ageReady.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(ageReady, (v) => { if (v) { stop(); resolve() } })
      })
    }

    // Get face crop as ImageData
    const crop = cropFaceFromImage(img, lm as NormalizedLandmark[])
    const ageResult = await detectAge(crop)
    aiAge.value = ageResult.age

    isProcessing.value = false
    showCanvas.value = true
  } catch (e) {
    console.error('Age detection failed:', e)
    qualityWarning.value = 'Analysis failed, please try again'
    isProcessing.value = false
  }
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

function cropFaceFromImage(img: HTMLImageElement, _lm: NormalizedLandmark[]): ImageData {
  // Simple crop: use the full image for now (age model handles it)
  const canvas = document.createElement('canvas')
  const size = 224 // common age model input size
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, size, size)
  return ctx.getImageData(0, 0, size, size)
}

function handleCanvasComplete() {
  // Show result after short delay
  setTimeout(() => {
    showResult.value = true
  }, 300)
}

function handleRetake() {
  showCanvas.value = false
  showResult.value = false
  aiAge.value = null
  isProcessing.value = false
}

function scrollToUpload() {
  document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-cream">
    <AppNav />

    <!-- Model loading progress -->
    <div
      v-if="!faceReady"
      class="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-coral-light"
    >
      <div
        class="h-full bg-coral transition-all duration-300 ease-out"
        style="width: 50%"
      />
    </div>

    <main>
      <!-- Hero -->
      <section class="px-4 pt-16 pb-12 md:pt-20 md:pb-16">
        <div class="max-w-2xl mx-auto text-center">
          <h1 class="font-heading text-[32px] md:text-[40px] font-bold text-black tracking-[-0.02em]">
            {{ t('age.hero.title') }}
          </h1>
          <p class="mt-4 text-[16px] md:text-[18px] text-muted-fg max-w-md mx-auto leading-relaxed">
            {{ t('age.hero.subtitle') }}
          </p>
          <div class="mt-8">
            <button
              type="button"
              class="w-full md:w-auto px-8 py-3.5 bg-coral text-white font-semibold text-[15px]
                     rounded-lg hover:bg-coral-hover active:scale-[0.97]
                     transition-all duration-150 shadow-[0_2px_8px_rgba(228,91,60,0.20)]"
              @click="scrollToUpload"
            >
              {{ $t('hero.cta') }}
            </button>
          </div>
        </div>
      </section>

      <FaceUploadZone :processing="isProcessing" @files-selected="handleFilesSelected" />

      <!-- Quality -->
      <div v-if="qualityWarning" class="px-4 pb-4">
        <div class="max-w-lg mx-auto">
          <p class="text-[14px] text-coral font-medium text-center bg-coral-light border border-coral/20 rounded-lg px-4 py-3">
            {{ qualityWarning }}
          </p>
        </div>
      </div>

      <template v-if="showCanvas && uploadedImage">
        <section class="px-4 pb-8">
          <div class="max-w-lg mx-auto">
            <FaceCanvas
              :image-url="uploadedImage"
              :landmarks="realLandmarks"
              :canvas-width="3"
              :canvas-height="4"
              :playing="true"
              @animation-complete="handleCanvasComplete"
            />
          </div>
        </section>

        <AgeResult
          v-if="aiAge !== null"
          :ai-age="aiAge"
          :visible="showResult"
          @retake="handleRetake"
        />
      </template>

      <CrossPromo mode="age" />
      <FAQ />

      <p class="text-center text-[11px] text-muted-fg mt-2">This tool is intended for users aged 13 and above.</p>

      <footer class="py-8 text-center">
        <p class="text-[12px] text-muted-fg">{{ $t('footer.text') }}</p>
      </footer>
    </main>
  </div>
</template>
