<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps<{
  imageUrl: string
  landmarks: Array<{ x: number; y: number }>
  canvasWidth: number
  canvasHeight: number
  playing: boolean
}>()

const emit = defineEmits<{ animationComplete: [] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const imageLoaded = ref(false)

type Phase = 'idle' | 'landmarks' | 'lines' | 'done'
const phase = ref<Phase>('idle')
const revealedIndices = ref<Set<number>>(new Set())
const lineProgress = ref([false, false, false, false])
const linePhase = ref(0)

// ── Sort landmarks by distance from face center ──
function distFromCenter(p: { x: number; y: number }): number {
  let cx = 0.5, cy = 0.45
  const pts = props.landmarks
  if (pts.length > 0) {
    // Use actual mean center of all points
    let sx = 0, sy = 0
    for (const pt of pts) { sx += pt.x; sy += pt.y }
    cx = sx / pts.length
    cy = sy / pts.length
  }
  return Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
}

const sortedLandmarks = computed(() =>
  [...props.landmarks].sort((a, b) => distFromCenter(a) - distFromCenter(b)),
)

// ── Canvas rendering ──
const dpr = ref(1)

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  dpr.value = window.devicePixelRatio || 1

  canvas.width = props.canvasWidth * dpr.value
  canvas.height = props.canvasHeight * dpr.value
  canvas.style.width = `${props.canvasWidth}px`
  canvas.style.height = `${props.canvasHeight}px`

  ctx.setTransform(dpr.value, 0, 0, dpr.value, 0, 0)
  ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight)

  const pts = sortedLandmarks.value
  const w = props.canvasWidth
  const h = props.canvasHeight

  for (let i = 0; i < pts.length; i++) {
    if (!revealedIndices.value.has(i)) continue
    const p = pts[i]!
    const px = p.x * w
    const py = p.y * h

    ctx.beginPath()
    ctx.arc(px, py, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(px, py, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(228,91,60,0.85)'
    ctx.fill()
  }
}

// ── Get key landmark position in canvas coords ──
function lm(idx: number): { x: number; y: number } | null {
  const p = props.landmarks[idx]
  if (!p) return null
  return { x: p.x * props.canvasWidth, y: p.y * props.canvasHeight }
}

// ── Line guides from real landmarks ──
const lineGuides = computed(() => {
  const w = props.canvasWidth || 400
  const h = props.canvasHeight || 400

  const nose = lm(1)         // nose tip
  const forehead = lm(10)    // hairline
  const chin = lm(152)       // chin
  const leo = lm(33)         // left eye outer
  const rei = lm(362)        // right eye inner
  const lmc = lm(61)         // left mouth
  const rmc = lm(291)        // right mouth

  const cx = nose?.x ?? w * 0.5
  const top = forehead?.y ?? h * 0.08
  const bot = chin?.y ?? h * 0.85

  // Eye line y: use average of eye and eyebrow landmarks around eyes
  const eyeY = leo?.y ?? h * 0.38
  const noseY = nose?.y ?? h * 0.52

  const lx = Math.min(leo?.x ?? w * 0.12, lmc?.x ?? w * 0.2) - 20
  const rx = Math.max(rei?.x ?? w * 0.88, rmc?.x ?? w * 0.8) + 20

  return {
    line1: { x1: cx, y1: top, x2: cx, y2: bot },
    line2: { x1: lx, y1: eyeY, x2: rx, y2: eyeY },
    line3: { x1: lx, y1: noseY, x2: rx, y2: noseY },
    line4: { x1: lx, y1: noseY + 14, x2: rx, y2: noseY + 14 },
  }
})

// ── Animation ──
let animFrame: number | null = null
let startTime = 0

function startAnimation() {
  revealedIndices.value.clear()
  linePhase.value = 0
  lineProgress.value = [false, false, false, false]
  phase.value = 'landmarks'
  startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const pts = sortedLandmarks.value
    const total = pts.length
    if (total === 0) return

    // Wave 1: 0–600ms, closest 33%
    const w1e = Math.floor(total * 0.33)
    const w1p = Math.min(1, elapsed / 600)
    for (let i = 0; i < w1e; i++) {
      if (i / w1e <= w1p) revealedIndices.value.add(i)
    }

    // Wave 2: 400–1000ms, middle 33–66%
    if (elapsed >= 400) {
      const w2s = Math.floor(total * 0.33)
      const w2e = Math.floor(total * 0.66)
      const w2p = Math.min(1, (elapsed - 400) / 600)
      for (let i = w2s; i < w2e; i++) {
        if ((i - w2s) / (w2e - w2s) <= w2p) revealedIndices.value.add(i)
      }
    }

    // Wave 3: 800–1800ms, outer 66–100%
    if (elapsed >= 800) {
      const w3s = Math.floor(total * 0.66)
      const w3p = Math.min(1, (elapsed - 800) / 1000)
      for (let i = w3s; i < total; i++) {
        if ((i - w3s) / (total - w3s) <= w3p) revealedIndices.value.add(i)
      }
    }

    render()

    if (elapsed < 1800) {
      animFrame = requestAnimationFrame(tick)
    } else {
      phase.value = 'lines'
      setTimeout(startLines, 600)
    }
  }

  animFrame = requestAnimationFrame(tick)
}

function startLines() {
  linePhase.value = 0
  animateNextLine()
}

function animateNextLine() {
  if (linePhase.value >= 4) {
    setTimeout(() => {
      phase.value = 'done'
      emit('animationComplete')
    }, 200)
    return
  }
  lineProgress.value[linePhase.value] = true
  setTimeout(() => {
    linePhase.value++
    animateNextLine()
  }, 400)
}

// ── Watch ──
watch(
  [() => props.imageUrl, () => props.playing],
  ([url, play]) => {
    if (url && play && props.landmarks.length > 0) {
      nextTick(() => startAnimation())
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full overflow-hidden rounded-xl border border-border bg-black"
    :style="{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }"
  >
    <!-- Photo layer -->
    <img
      :src="imageUrl"
      alt=""
      class="absolute inset-0 w-full h-full object-contain"
      @load="imageLoaded = true"
    >

    <!-- Canvas overlay -->
    <canvas
      v-if="imageUrl && imageLoaded"
      ref="canvasRef"
      class="absolute inset-0 w-full h-full"
      style="pointer-events: none;"
    />

    <!-- SVG measurement lines -->
    <svg
      v-if="phase === 'lines' || phase === 'done'"
      class="absolute inset-0"
      style="pointer-events: none;"
      :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
    >
      <line v-if="lineProgress[0]"
        :x1="lineGuides.line1.x1" :y1="lineGuides.line1.y1"
        :x2="lineGuides.line1.x2" :y2="lineGuides.line1.y2"
        stroke="#E45B3C" stroke-opacity="0.6" stroke-width="1.5"
        stroke-dasharray="6 5" class="line-anim" />
      <line v-if="lineProgress[1]"
        :x1="lineGuides.line2.x1" :y1="lineGuides.line2.y1"
        :x2="lineGuides.line2.x2" :y2="lineGuides.line2.y2"
        stroke="#E45B3C" stroke-opacity="0.5" stroke-width="1.5"
        class="line-anim" />
      <line v-if="lineProgress[2]"
        :x1="lineGuides.line3.x1" :y1="lineGuides.line3.y1"
        :x2="lineGuides.line3.x2" :y2="lineGuides.line3.y2"
        stroke="#E45B3C" stroke-opacity="0.5" stroke-width="1.5"
        class="line-anim" />
      <line v-if="lineProgress[3]"
        :x1="lineGuides.line4.x1" :y1="lineGuides.line4.y1"
        :x2="lineGuides.line4.x2" :y2="lineGuides.line4.y2"
        stroke="#E45B3C" stroke-opacity="0.4" stroke-width="1.5"
        class="line-anim" />
    </svg>
  </div>
</template>

<style scoped>
@keyframes lineReveal {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.line-anim {
  animation: lineReveal 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) forwards;
}
</style>
