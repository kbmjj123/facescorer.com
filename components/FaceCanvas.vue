<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  imageUrl: string
  landmarks: Array<{ x: number; y: number }>
  playing: boolean
}>()

const emit = defineEmits<{ animationComplete: [] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const imageLoaded = ref(false)

const renderWidth = ref(0)
const renderHeight = ref(0)
const containerReady = ref(false)  // ← 新增：容器尺寸就绪标志

let resizeObs: ResizeObserver | null = null

onMounted(() => {
  resizeObs = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return
    renderWidth.value = entry.contentRect.width
    renderHeight.value = entry.contentRect.height
    if (renderWidth.value > 0 && renderHeight.value > 0) {
      containerReady.value = true  // ← 容器尺寸就绪
      // 如果动画已经跑完，resize 时重新初始化 canvas 尺寸
      if (phase.value === 'done' || phase.value === 'landmarks') {
        nextTick(() => initCanvas())
      }
    }
  })
  if (containerRef.value) resizeObs.observe(containerRef.value)
})

onBeforeUnmount(() => {
  resizeObs?.disconnect()
  if (animFrame) cancelAnimationFrame(animFrame)
})

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = renderWidth.value * dpr
  canvas.height = renderHeight.value * dpr
  canvas.style.width = `${renderWidth.value}px`
  canvas.style.height = `${renderHeight.value}px`
  const ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

// ── object-contain 实际渲染区域 ──
function getImageRenderRect() {
  const img = imageRef.value
  const containerW = renderWidth.value
  const containerH = renderHeight.value

  if (!img || !img.naturalWidth || !img.naturalHeight) {
    return { x: 0, y: 0, w: containerW, h: containerH }
  }

  const containerRatio = containerW / containerH
  const imgRatio = img.naturalWidth / img.naturalHeight
  let renderW: number, renderH: number

  if (imgRatio > containerRatio) {
    renderW = containerW
    renderH = containerW / imgRatio
  } else {
    renderH = containerH
    renderW = containerH * imgRatio
  }

  return {
    x: (containerW - renderW) / 2,
    y: (containerH - renderH) / 2,
    w: renderW,
    h: renderH,
  }
}

function toPixel(p: { x: number; y: number }) {
  const rect = getImageRenderRect()
  return {
    x: rect.x + p.x * rect.w,
    y: rect.y + p.y * rect.h,
  }
}

// ── 动画状态 ──
type Phase = 'idle' | 'landmarks' | 'lines' | 'done'
const phase = ref<Phase>('idle')
const revealedAt = ref<Map<number, number>>(new Map())  // index → 出现时间
const lineProgress = ref([false, false, false, false])
const linePhase = ref(0)
let animFrame: number | null = null

const FADE_DURATION = 300

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// ── 排序 ──
function distFromCenter(p: { x: number; y: number }): number {
  const pts = props.landmarks
  if (!pts.length) return 0
  let sx = 0, sy = 0
  for (const pt of pts) { sx += pt.x; sy += pt.y }
  const cx = sx / pts.length
  const cy = sy / pts.length
  return Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
}

const sortedLandmarks = computed(() =>
  [...props.landmarks].sort((a, b) => distFromCenter(a) - distFromCenter(b))
)

// ── 渲染（接收当前时间用于 fade 计算）──
function render(now: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, renderWidth.value, renderHeight.value)

  const pts = sortedLandmarks.value
  for (let i = 0; i < pts.length; i++) {
    const appearedAt = revealedAt.value.get(i)
    if (appearedAt === undefined) continue

    const fadeProgress = Math.min(1, (now - appearedAt) / FADE_DURATION)
    const alpha = easeOut(fadeProgress)

    const { x, y } = toPixel(pts[i]!)

    ctx.beginPath()
    ctx.arc(x, y, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${0.4 * alpha})`
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(228,91,60,${0.85 * alpha})`
    ctx.fill()
  }
}

// ── 动画主循环 ──
function startAnimation() {
  console.log('landmarks count:', props.landmarks.length)
  console.log('sortedLandmarks count:', sortedLandmarks.value.length)
  if (animFrame) cancelAnimationFrame(animFrame)
  initCanvas()
  revealedAt.value.clear()
  linePhase.value = 0
  lineProgress.value = [false, false, false, false]
  phase.value = 'landmarks'

  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const pts = sortedLandmarks.value
    const total = pts.length
    if (!total) return

    // 三波次扩散，记录每个点的出现时间
    const w1e = Math.floor(total * 0.33)
    const w1p = Math.min(1, elapsed / 600)
    for (let i = 0; i < w1e; i++) {
      if (!revealedAt.value.has(i) && i / w1e <= w1p) {
        revealedAt.value.set(i, now)
      }
    }
    if (elapsed >= 400) {
      const w2s = Math.floor(total * 0.33)
      const w2e = Math.floor(total * 0.66)
      const w2p = Math.min(1, (elapsed - 400) / 600)
      for (let i = w2s; i < w2e; i++) {
        if (!revealedAt.value.has(i) && (i - w2s) / (w2e - w2s) <= w2p) {
          revealedAt.value.set(i, now)
        }
      }
    }
    if (elapsed >= 800) {
      const w3s = Math.floor(total * 0.66)
      const w3p = Math.min(1, (elapsed - 800) / 1000)
      for (let i = w3s; i < total; i++) {
        if (!revealedAt.value.has(i) && (i - w3s) / (total - w3s) <= w3p) {
          revealedAt.value.set(i, now)
        }
      }
    }

    render(now)

    // 等最后一个点也 fade 完
    if (elapsed < 1800 + FADE_DURATION) {
      animFrame = requestAnimationFrame(tick)
    } else {
      phase.value = 'lines'
      // 不用 setTimeout，lines 出现由 CSS delay 控制
      // 只需要切换 phase，让 SVG 进入 DOM，CSS 自动接管
      lineProgress.value = [true, true, true, true]
    }
  }

  animFrame = requestAnimationFrame(tick)
}

// ── SVG 辅助线坐标 + 长度 ──
const lineGuides = computed(() => {
  function len(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }

  const lmPx = (idx: number) => {
    const p = props.landmarks[idx]
    return p ? toPixel(p) : null
  }

  const nose     = lmPx(1)
  const forehead = lmPx(10)
  const chin     = lmPx(152)
  const leo      = lmPx(33)
  const rei      = lmPx(362)
  const lmc      = lmPx(61)
  const rmc      = lmPx(291)

  const rect = getImageRenderRect()
  const cx   = nose?.x      ?? rect.x + rect.w * 0.5
  const top  = forehead?.y  ?? rect.y + rect.h * 0.08
  const bot  = chin?.y      ?? rect.y + rect.h * 0.85
  const eyeY = leo?.y       ?? rect.y + rect.h * 0.38
  const noseY = nose?.y     ?? rect.y + rect.h * 0.52
  const lx = Math.min(leo?.x ?? rect.x + rect.w * 0.12,
                      lmc?.x ?? rect.x + rect.w * 0.2) - 20
  const rx = Math.max(rei?.x ?? rect.x + rect.w * 0.88,
                      rmc?.x ?? rect.x + rect.w * 0.8) + 20

  return {
    line1: { x1: cx, y1: top,        x2: cx, y2: bot,        len: len(cx, top, cx, bot) },
    line2: { x1: lx, y1: eyeY,       x2: rx, y2: eyeY,       len: len(lx, eyeY, rx, eyeY) },
    line3: { x1: lx, y1: noseY,      x2: rx, y2: noseY,      len: len(lx, noseY, rx, noseY) },
    line4: { x1: lx, y1: noseY + 14, x2: rx, y2: noseY + 14, len: len(lx, noseY + 14, rx, noseY + 14) },
  }
})

function onLastLineEnd() {
  phase.value = 'done'
  emit('animationComplete')
}

// ── Watch：三个条件全部就绪才启动 ──
watch(
  [() => props.imageUrl, () => props.playing, imageLoaded, containerReady],
  ([url, play, loaded, ready]) => {
    if (url && play && loaded && ready && props.landmarks.length > 0) {
      nextTick(() => startAnimation())
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full overflow-hidden rounded-xl border border-border bg-black"
    style="aspect-ratio: 3 / 4;"
  >
    <img
      ref="imageRef"
      :src="imageUrl"
      alt=""
      class="absolute inset-0 w-full h-full object-contain"
      @load="imageLoaded = true"
    />

    <canvas
      v-if="imageLoaded && containerReady"
      ref="canvasRef"
      class="absolute inset-0"
      style="pointer-events: none;"
    />

    <svg
      v-if="phase === 'lines' || phase === 'done'"
      class="absolute inset-0 w-full h-full"
      style="pointer-events: none;"
      :viewBox="`0 0 ${renderWidth} ${renderHeight}`"
    >
      <!-- 对称轴，delay 0 -->
      <line
        v-if="lineProgress[0]"
        :x1="lineGuides.line1.x1" :y1="lineGuides.line1.y1"
        :x2="lineGuides.line1.x2" :y2="lineGuides.line1.y2"
        stroke="#E45B3C" stroke-opacity="0.6" stroke-width="1.5"
        stroke-dasharray="6 5"
        :style="`--len:${lineGuides.line1.len};--delay:0ms`"
        class="guide-line"
      />
      <!-- 眼线，delay 350ms -->
      <line
        v-if="lineProgress[1]"
        :x1="lineGuides.line2.x1" :y1="lineGuides.line2.y1"
        :x2="lineGuides.line2.x2" :y2="lineGuides.line2.y2"
        stroke="#E45B3C" stroke-opacity="0.5" stroke-width="1.5"
        :style="`--len:${lineGuides.line2.len};--delay:350ms`"
        class="guide-line"
      />
      <!-- 鼻底线，delay 650ms -->
      <line
        v-if="lineProgress[2]"
        :x1="lineGuides.line3.x1" :y1="lineGuides.line3.y1"
        :x2="lineGuides.line3.x2" :y2="lineGuides.line3.y2"
        stroke="#E45B3C" stroke-opacity="0.5" stroke-width="1.5"
        :style="`--len:${lineGuides.line3.len};--delay:650ms`"
        class="guide-line"
      />
      <!-- 第四线，delay 950ms，animationend 触发完成 -->
      <line
        v-if="lineProgress[3]"
        :x1="lineGuides.line4.x1" :y1="lineGuides.line4.y1"
        :x2="lineGuides.line4.x2" :y2="lineGuides.line4.y2"
        stroke="#E45B3C" stroke-opacity="0.4" stroke-width="1.5"
        :style="`--len:${lineGuides.line4.len};--delay:950ms`"
        class="guide-line"
        @animationend="onLastLineEnd"
      />
    </svg>
  </div>
</template>

<style scoped>
.guide-line {
  stroke-dasharray: calc(var(--len) * 1px);
  stroke-dashoffset: calc(var(--len) * 1px);
  animation: drawLine 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)
             var(--delay) forwards;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}
</style>