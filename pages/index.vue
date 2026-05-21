<script setup lang="ts">
import type { FaceScore } from '~/components/FaceResult.vue'
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

const { isReady, loadProgress, detect, error: modelError } = useFaceLandmarker()
const { compute } = useFaceScoring()

// ── Pipeline state ──
const uploadedImage = ref<string | null>(null)
const isProcessing = ref(false)
const showCanvas = ref(false)
const showResult = ref(false)
const showShare = ref(false)

const realLandmarks = ref<Array<{ x: number; y: number }>>([])
const faceScore = ref<FaceScore | null>(null)

// ── Photo quality flags ──
const qualityWarning = ref<string | null>(null)
const originalFile = ref<File | null>(null)

// ── Handle upload ──
async function handleFilesSelected(files: File[]) {
  if (files.length === 0) return

  const file = files[0]!
  originalFile.value = file

  // Clean previous
  if (uploadedImage.value) URL.revokeObjectURL(uploadedImage.value)
  uploadedImage.value = URL.createObjectURL(file)
  isProcessing.value = true
  qualityWarning.value = null
  showCanvas.value = false
  showResult.value = false
  showShare.value = false

  try {
    // Convert HEIC if needed
    let imageFile: Blob = file
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      const heic2any = (await import('heic2any')).default
      imageFile = await heic2any({ blob: file, toType: 'image/jpeg' }) as Blob
    }

    // Load as HTMLImageElement for detection
    const img = await loadImageElement(URL.createObjectURL(imageFile))

    // Wait for model if not ready
    if (!isReady.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(isReady, (v) => {
          if (v) { stop(); resolve() }
        })
      })
    }

    // Run face detection
    const result = await detect(img)

    // Quality checks
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      qualityWarning.value = 'Please upload a clear front-facing photo'
      isProcessing.value = false
      return
    }

    if (result.faceLandmarks.length > 1) {
      qualityWarning.value = 'Analyzing the closest face'
    }

    // Side-face check (via blendshapes if available)
    if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
      const bs = result.faceBlendshapes[0]!
      // Find a yaw-related blendshape (approximate)
      const yawIdx = bs.categories?.findIndex(c => c.categoryName === 'headYaw') ?? -1
      if (yawIdx >= 0 && bs.categories![yawIdx]!.score > 0.4) {
        qualityWarning.value = 'For best results, use a front-facing photo'
      }
    }

    // Convert landmarks to simplified format
    const lm = result.faceLandmarks[0]!
    realLandmarks.value = lm.map((l: NormalizedLandmark) => ({ x: l.x, y: l.y }))

    // Compute face score
    faceScore.value = compute(result)

    // Stop upload processing, show canvas animation
    isProcessing.value = false
    showCanvas.value = true
  } catch (e) {
    console.error('Detection failed:', e)
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

function handleAnimationComplete() {
  showResult.value = true

  // Auto-generate share card after dimensions appear
  setTimeout(() => {
    showShare.value = true
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen bg-cream">
    <AppNav />

    <!-- Model load progress bar -->
    <div
      v-if="!isReady"
      class="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-coral-light"
    >
      <div
        class="h-full bg-coral transition-all duration-300 ease-out"
        :style="{ width: `${loadProgress}%` }"
      />
    </div>

    <main>
      <Hero />
      <FaceUploadZone
        :processing="isProcessing"
        @files-selected="handleFilesSelected"
      />

      <!-- Quality warnings -->
      <div v-if="qualityWarning" class="px-4 pb-4">
        <div class="max-w-lg mx-auto">
          <p class="text-[14px] text-coral font-medium text-center bg-coral-light border border-coral/20 rounded-lg px-4 py-3">
            {{ qualityWarning }}
          </p>
        </div>
      </div>

      <!-- Model error -->
      <div v-if="modelError" class="px-4 pb-4">
        <div class="max-w-lg mx-auto">
          <p class="text-[14px] font-medium text-center bg-coral-light border border-coral/20 rounded-lg px-4 py-3">
            {{ modelError }}
          </p>
        </div>
      </div>

      <template v-if="showCanvas && uploadedImage">
        <!-- Canvas -->
        <section class="px-4 pb-8">
          <div class="max-w-lg mx-auto">
            <FaceCanvas
              :image-url="uploadedImage"
              :landmarks="realLandmarks"
              :canvas-width="400"
              :canvas-height="400"
              :playing="true"
              class="aspect-square"
              @animation-complete="handleAnimationComplete"
            />
          </div>
        </section>

        <!-- Result -->
        <FaceResult
          v-if="faceScore"
          :score="faceScore"
          :visible="showResult"
        />

        <!-- Share card -->
        <ShareCard
          v-if="faceScore"
          :image-url="uploadedImage"
          :label="faceScore.label"
          :top-percent="faceScore.topPercent"
          :visible="showShare"
        />
      </template>

      <!-- Cross-promo -->
      <CrossPromo />

      <!-- FAQ -->
      <FAQ />

      <p class="text-center text-[11px] text-muted-fg mt-2">This tool is intended for users aged 13 and above.</p>

      <!-- Footer -->
      <footer class="py-8 text-center">
        <p class="text-[12px] text-muted-fg">{{ $t('footer.text') }}</p>
      </footer>
    </main>
  </div>
</template>
