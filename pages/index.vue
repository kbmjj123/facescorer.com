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
const croppedImageUrl = ref<string | null>(null)

// ── Handle upload ──
async function handleFilesSelected(files: File[]) {
  if (files.length === 0) return

  const file = files[0]!
  originalFile.value = file

  // 清理上一次的资源
  if (uploadedImage.value) {
    URL.revokeObjectURL(uploadedImage.value)
    uploadedImage.value = null
  }
  if (croppedImageUrl.value) {
    URL.revokeObjectURL(croppedImageUrl.value)
    croppedImageUrl.value = null
  }

  // 重置所有状态
  isProcessing.value = true
  qualityWarning.value = null
  showCanvas.value = false
  showResult.value = false
  showShare.value = false
  realLandmarks.value = []
  faceScore.value = null

  try {
    // 处理 HEIC 格式
    let imageBlob: Blob = file
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      const heic2any = (await import('heic2any')).default
      imageBlob = await heic2any({ blob: file, toType: 'image/jpeg' }) as Blob
    }

    // 先显示原图预览（用户立即看到图片，不用等检测完）
    const originalUrl = URL.createObjectURL(imageBlob)
    uploadedImage.value = originalUrl

    // 加载为 HTMLImageElement 用于检测
    const img = await loadImageElement(originalUrl)

    // 等待模型就绪
    if (!isReady.value) {
      await new Promise<void>((resolve) => {
        const stop = watch(isReady, (v) => {
          if (v) { stop(); resolve() }
        })
      })
    }

    // 运行人脸检测
    const result = await detect(img)

    // 质量检查：未检测到人脸
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      qualityWarning.value = 'Please upload a clear front-facing photo'
      isProcessing.value = false
      return
    }

    // 质量检查：多张人脸
    if (result.faceLandmarks.length > 1) {
      qualityWarning.value = 'Multiple faces detected — analyzing the closest one'
    }

    // 质量检查：侧脸
    if (result.faceBlendshapes?.[0]) {
      const bs = result.faceBlendshapes[0]
      const yaw = bs.categories?.find(c => c.categoryName === 'headYaw')
      if (yaw && yaw.score > 0.4) {
        qualityWarning.value = 'For best results, use a front-facing photo'
      }
    }

    // 提取关键点
    const lm = result.faceLandmarks[0]!
    const mapped = Array.from(lm).map((l: NormalizedLandmark) => ({
      x: l.x,
      y: l.y,
    }))

    // 裁剪人脸区域 + 重新映射关键点
    const { croppedUrl, remappedLandmarks } = await cropFaceRegion(img, mapped)

    // 清理原始 URL，换成裁剪后的
    URL.revokeObjectURL(originalUrl)
    croppedImageUrl.value = croppedUrl
    uploadedImage.value = croppedUrl
    realLandmarks.value = remappedLandmarks

    // 计算评分
    faceScore.value = compute(result)

    // 完成，显示 Canvas 动画
    isProcessing.value = false
    showCanvas.value = true

  } catch (e) {
    console.error('Detection failed:', e)
    qualityWarning.value = 'Analysis failed, please try again'
    isProcessing.value = false
  }
}

// ── 裁剪人脸区域工具函数 ──
async function cropFaceRegion(
  img: HTMLImageElement,
  landmarks: Array<{ x: number; y: number }>,
  paddingRatio = 0.28,
): Promise<{
  croppedUrl: string
  remappedLandmarks: Array<{ x: number; y: number }>
}> {
  const imgW = img.naturalWidth
  const imgH = img.naturalHeight

  // 计算所有关键点的边界框（归一化坐标）
  let minX = 1, minY = 1, maxX = 0, maxY = 0
  for (const p of landmarks) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  // 加 padding 外扩
  const faceW = maxX - minX
  const faceH = maxY - minY
  const padX = faceW * paddingRatio
  const padY = faceH * paddingRatio

  const cropX = Math.max(0, minX - padX)
  const cropY = Math.max(0, minY - padY)
  const cropW = Math.min(1 - cropX, faceW + padX * 2)
  const cropH = Math.min(1 - cropY, faceH + padY * 2)

  // 转换为像素坐标
  const px = Math.round(cropX * imgW)
  const py = Math.round(cropY * imgH)
  const pw = Math.round(cropW * imgW)
  const ph = Math.round(cropH * imgH)

  // Canvas 裁剪
  const canvas = document.createElement('canvas')
  canvas.width = pw
  canvas.height = ph
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, px, py, pw, ph, 0, 0, pw, ph)

  // 生成裁剪后的 blob URL
  const croppedUrl = await new Promise<string>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(URL.createObjectURL(blob!)),
      'image/jpeg',
      0.95,
    )
  })

  // 重新映射关键点到裁剪后的坐标系
  const remappedLandmarks = landmarks.map(p => ({
    x: (p.x - cropX) / cropW,
    y: (p.y - cropY) / cropH,
  }))

  return { croppedUrl, remappedLandmarks }
}

// ── 动画完成回调 ──
function handleAnimationComplete() {
  showResult.value = true
  setTimeout(() => {
    showShare.value = true
  }, 1000)
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
              :playing="true"
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
