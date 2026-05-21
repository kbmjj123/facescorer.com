<script setup lang="ts">
const props = defineProps<{
  imageUrl: string
  label: string
  topPercent: number
  visible: boolean
}>()

const { t } = useI18n()

const previewSrc = ref<string | null>(null)
const copied = ref(false)

const W = 1080
const H = 1920

// ── Auto-generate when visible ──
let generated = false

watch(
  () => props.visible,
  async (v) => {
    if (v && !generated) {
      generated = true
      // Wait for image to be available, then render
      await nextTick()
      await new Promise((r) => setTimeout(r, 300)) // let DOM settle
      await renderCard()
    }
  },
)

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

async function renderCard() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true

  // ① Background
  ctx.fillStyle = '#F5F0E8'
  ctx.fillRect(0, 0, W, H)

  // ② User photo — top 58% of card height
  const photoH = Math.round(H * 0.58) // ~1109px
  try {
    const img = await loadImage(props.imageUrl)
    // Scale to fit width 1080, maintaining aspect ratio
    const scale = W / img.width
    const drawH = img.height * scale
    // Center vertically within the photo zone
    const offsetY = Math.max(0, (photoH - drawH) / 2)
    ctx.drawImage(img, 0, offsetY, W, drawH)
  } catch {
    // If image fails, leave the area empty
  }

  // ③ Gradient mask: 300px from photoH to photoH+300, transparent → background
  const gradientY = photoH
  const gradientH = 300
  const grad = ctx.createLinearGradient(0, gradientY, 0, gradientY + gradientH)
  grad.addColorStop(0, 'rgba(245,240,232,0)')
  grad.addColorStop(1, 'rgba(245,240,232,1)')
  ctx.fillStyle = grad
  ctx.fillRect(0, gradientY, W, gradientH)

  // ④ Decorative: small lines top-left
  ctx.strokeStyle = 'rgba(228,91,60,0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(80, 80)
  ctx.lineTo(200, 80)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(80, 80)
  ctx.lineTo(80, 150)
  ctx.stroke()

  // ⑤ Decorative: vertical accent bar left of label
  const labelY = H - 700 // ~1220
  ctx.fillStyle = '#E45B3C'
  ctx.fillRect(100, labelY - 60, 4, 50)

  // ⑥ Label text: "Harmonious Symmetry"
  ctx.fillStyle = '#1C1C1E'
  ctx.font = 'bold 72px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const labelText = `"${props.label}"`
  ctx.fillText(labelText, W / 2, labelY)

  // ⑦ Sub-label: "Top 12% · Facial Symmetry"
  const subLabelY = labelY + 72 + 24
  ctx.fillStyle = '#E45B3C'
  ctx.font = '48px serif'
  ctx.fillText(`Top ${props.topPercent}% · Facial Symmetry`, W / 2, subLabelY)

  // ⑧ Description
  const descY = subLabelY + 48 + 24
  ctx.fillStyle = '#6E6E73'
  ctx.font = '40px sans-serif'
  const descText = 'Your facial structure creates a natural sense of trust and warmth.'

  // Word wrap to 900px
  const words = descText.split(' ')
  let line = ''
  let lineY = descY
  const maxWidth = 900
  for (const word of words) {
    const testLine = line ? line + ' ' + word : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, W / 2, lineY)
      line = word
      lineY += 60
      if (lineY - descY >= 120) break // max 2 lines
    } else {
      line = word
    }
  }
  if (line && lineY - descY < 120) {
    ctx.fillText(line, W / 2, lineY)
  }

  // ⑨ Brand
  ctx.fillStyle = '#6E6E73'
  ctx.font = '36px serif'
  ctx.textAlign = 'center'
  ctx.fillText('facescorer.com', W / 2, H - 80)

  // ── Export preview ──
  previewSrc.value = canvas.toDataURL('image/png')
}

// ── Download ──
function download() {
  if (!previewSrc.value) return
  const a = document.createElement('a')
  a.href = previewSrc.value
  a.download = 'facescorer-result.png'
  a.click()
}

// ── Copy to clipboard ──
async function copy() {
  if (!previewSrc.value) return
  try {
    const blob = await fetch(previewSrc.value).then((r) => r.blob())
    const item = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([item])
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Fallback for browsers without ClipboardItem
    copied.value = false
  }
}

// ── Share (Web Share API) ──
async function share() {
  if (!previewSrc.value || !navigator.share) return
  try {
    const blob = await fetch(previewSrc.value).then((r) => r.blob())
    const file = new File([blob], 'facescorer-result.png', { type: 'image/png' })
    await navigator.share({
      title: 'My Face Analysis',
      text: 'Check out my face analysis result!',
      files: [file],
    })
  } catch {
    // User cancelled or not supported
  }
}

const supportsShare = computed(() => typeof navigator !== 'undefined' && !!navigator.share)
</script>

<template>
  <section v-if="visible && previewSrc" class="px-4 pb-24">
    <div class="max-w-2xl mx-auto">
      <!-- Preview image -->
      <div class="flex justify-center mb-6">
        <img
          :src="previewSrc"
          alt="Share card preview"
          class="w-full max-w-[360px] aspect-[9/16] object-contain border border-border rounded-xl shadow-card"
        >
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 max-w-[360px] mx-auto">
        <button
          type="button"
          class="flex-1 py-3.5 bg-coral text-white font-semibold text-[14px] rounded-lg
                 hover:bg-coral-hover active:scale-[0.97] transition-all duration-150
                 shadow-[0_2px_8px_rgba(228,91,60,0.20)]"
          @click="download"
        >
          {{ t('share.download') }}
        </button>
        <button
          type="button"
          class="flex-1 py-3.5 border border-border text-black font-semibold text-[14px] rounded-lg
                 hover:bg-cream active:scale-[0.97] transition-all duration-150"
          :class="copied ? '!bg-coral-light !text-coral !border-coral' : ''"
          @click="copy"
        >
          {{ copied ? t('share.copied') : t('share.copy') }}
        </button>
        <button
          v-if="supportsShare"
          type="button"
          class="flex-1 py-3.5 border border-border text-black font-semibold text-[14px] rounded-lg
                 hover:bg-cream active:scale-[0.97] transition-all duration-150"
          @click="share"
        >
          {{ t('share.share') }}
        </button>
      </div>

      <AdSlot position="below-share" />
    </div>
  </section>
</template>
