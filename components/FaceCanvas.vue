<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps<{
  imageUrl: string
  landmarks: Array<{ x: number; y: number }>
  canvasWidth: number
  canvasHeight: number
  playing: boolean
}>()

const emit = defineEmits<{
  animationComplete: []
}>()

// ── Refs ──
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

// ── Animation state ──
type Phase = 'idle' | 'landmarks' | 'lines' | 'done'
const phase = ref<Phase>('idle')
const revealedIndices = ref<Set<number>>(new Set())
const lineProgress = ref([false, false, false, false])
const linePhase = ref(0) // which line is currently animating (0-3), 4 = all done

// ── Mock landmarks (478 points, face-like distribution) ──
function generateMockLandmarks(count: number) {
  const points: Array<{ x: number; y: number }> = []
  const cx = 0.5, cy = 0.45 // face center (normalized)
  const rx = 0.28, ry = 0.38 // face ellipse radii

  for (let i = 0; i < count; i++) {
    // Distribute points with varying densities
    const t = i / count
    let px: number, py: number

    if (t < 0.25) {
      // Central cluster: eyes, nose, mouth area (high density)
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 0.12
      px = cx + Math.cos(angle) * dist * 0.6
      py = cy + Math.sin(angle) * dist
    } else if (t < 0.55) {
      // Mid face: eyebrows, cheekbones
      const angle = Math.random() * Math.PI * 2
      const dist = 0.08 + Math.random() * 0.18
      px = cx + Math.cos(angle) * dist * 0.65
      py = cy - 0.02 + Math.sin(angle) * dist * 0.9
    } else if (t < 0.8) {
      // Outer face: jaw, chin outline
      const a = Math.random() * Math.PI * 2
      const d = 0.92 + Math.random() * 0.08
      px = cx + Math.cos(a) * rx * d
      py = cy + Math.sin(a) * ry * d * 0.8
    } else {
      // Forehead and periphery
      const a = Math.random() * Math.PI * 2
      const d = 0.7 + Math.random() * 0.3
      px = cx + Math.cos(a) * rx * d * 0.85
      py = cy - 0.12 + Math.sin(a) * ry * d * 0.6
    }

    points.push({ x: Math.max(0, Math.min(1, px)), y: Math.max(0, Math.min(1, py)) })
  }

  return points
}

const allLandmarks = ref<Array<{ x: number; y: number }>>([])

// ── Distance from center ──
function distFromCenter(p: { x: number; y: number }): number {
  const cx = 0.5, cy = 0.45
  return Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
}

// ── Sorted landmarks by distance ──
const sortedLandmarks = computed(() => {
  const pts = allLandmarks.value.length > 0 ? allLandmarks.value : props.landmarks
  return [...pts].sort((a, b) => distFromCenter(a) - distFromCenter(b))
})

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

  // Draw revealed points
  const pts = sortedLandmarks.value
  for (let i = 0; i < pts.length; i++) {
    if (!revealedIndices.value.has(i)) continue
    const p = pts[i]!
    const px = p.x * props.canvasWidth
    const py = p.y * props.canvasHeight

    // White outer ring
    ctx.beginPath()
    ctx.arc(px, py, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fill()

    // Coral fill
    ctx.beginPath()
    ctx.arc(px, py, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(228,91,60,0.85)'
    ctx.fill()
  }
}

// ── Computed line positions from landmarks ──
const lineGuides = computed(() => {
  const pts = allLandmarks.value.length > 0 ? allLandmarks.value : props.landmarks
  const w = props.canvasWidth || 400
  const h = props.canvasHeight || 400

  // Vertical center axis
  const centerX = w * 0.5

  // Find eye-level y (dense horizontal band around y~0.38-0.42 in normalized)
  const eyeY = h * 0.38

  // Find nose-bottom y (around y~0.52)
  const noseY = h * 0.52

  // Find chin y
  const chinY = h * 0.78

  // Left/right bounds for horizontal lines
  const leftX = w * 0.22
  const rightX = w * 0.78

  return {
    line1: { x1: centerX, y1: h * 0.1, x2: centerX, y2: chinY },                                              // symmetry axis
    line2: { x1: leftX, y1: eyeY, x2: rightX, y2: eyeY },                                                     // brow line
    line3: { x1: leftX, y1: noseY, x2: rightX, y2: noseY },                                                   // nose line
    line4: { x1: w * 0.15, y1: eyeY - h * 0.04, x2: w * 0.85, y2: eyeY + h * 0.1 },                         // five-eye guide
  }
})

// ── Animation controller ──
let animFrame: number | null = null
let startTime = 0

function startAnimation() {
  // Reset
  revealedIndices.value.clear()
  linePhase.value = 0
  lineProgress.value = [false, false, false, false]
  phase.value = 'landmarks'
  startTime = performance.now()

  // Phase 1: Landmark reveal via requestAnimationFrame with stagger
  // We use a frame loop but control which points appear based on elapsed time
  function tick(now: number) {
    const elapsed = now - startTime
    const pts = sortedLandmarks.value

    // Determine which wave to reveal based on distance percentile
    const totalPts = pts.length
    if (totalPts === 0) return

    // Wave 1: 0-600ms, distance percentile 0-33%
    if (elapsed >= 0) {
      const wave1Cutoff = Math.floor(totalPts * 0.33)
      for (let i = 0; i < wave1Cutoff; i++) {
        // progressive reveal within wave
        const waveProgress = Math.min(1, elapsed / 600)
        if ((i / wave1Cutoff) <= waveProgress) {
          revealedIndices.value.add(i)
        }
      }
    }

    // Wave 2: 400-1000ms, distance percentile 33-66%
    if (elapsed >= 400) {
      const wave2Start = Math.floor(totalPts * 0.33)
      const wave2End = Math.floor(totalPts * 0.66)
      const wave2Progress = Math.min(1, (elapsed - 400) / 600)
      for (let i = wave2Start; i < wave2End; i++) {
        if (((i - wave2Start) / (wave2End - wave2Start)) <= wave2Progress) {
          revealedIndices.value.add(i)
        }
      }
    }

    // Wave 3: 800-1800ms, distance percentile 66-100%
    if (elapsed >= 800) {
      const wave3Start = Math.floor(totalPts * 0.66)
      const wave3Progress = Math.min(1, (elapsed - 800) / 1000)
      for (let i = wave3Start; i < totalPts; i++) {
        if (((i - wave3Start) / (totalPts - wave3Start)) <= wave3Progress) {
          revealedIndices.value.add(i)
        }
      }
    }

    render()

    if (elapsed < 1800) {
      animFrame = requestAnimationFrame(tick)
    } else {
      // All landmarks revealed — start line phase after 600ms delay
      phase.value = 'lines'
      setTimeout(() => {
        startLines()
      }, 600)
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
    // All lines done — wait 200ms then emit complete
    setTimeout(() => {
      phase.value = 'done'
      emit('animationComplete')
    }, 200)
    return
  }

  lineProgress.value[linePhase.value] = true

  // Each line takes 400ms
  setTimeout(() => {
    linePhase.value++
    animateNextLine()
  }, 400)
}

// ── Watch for start ──
// Need both imageUrl ready AND playing=true to begin
watch(
  [() => props.imageUrl, () => props.playing],
  ([url, play]) => {
    if (url && play) {
      if (allLandmarks.value.length === 0) {
        allLandmarks.value = props.landmarks.length > 0 ? props.landmarks : generateMockLandmarks(478)
      }
      // Wait one tick for canvas ref to exist after v-if renders
      nextTick(() => {
        startAnimation()
      })
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div ref="containerRef" class="relative" :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }">
    <!-- Photo layer -->
    <img
      :src="imageUrl"
      alt=""
      class="absolute inset-0 w-full h-full object-cover"
    >

    <!-- Canvas: landmark dots -->
    <canvas
      v-if="imageUrl"
      ref="canvasRef"
      class="absolute inset-0"
      style="pointer-events: none;"
    />

    <!-- SVG: measurement lines overlay -->
    <svg
      v-if="phase === 'lines' || phase === 'done'"
      class="absolute inset-0"
      style="pointer-events: none;"
      :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
      width="100%"
      height="100%"
    >
      <!-- Line 1: Symmetry axis (dashed vertical) -->
      <line
        v-if="lineProgress[0]"
        :x1="lineGuides.line1.x1" :y1="lineGuides.line1.y1"
        :x2="lineGuides.line1.x2" :y2="lineGuides.line1.y2"
        stroke="#E45B3C"
        stroke-opacity="0.7"
        stroke-width="1.5"
        stroke-dasharray="6 5"
        class="line-anim"
        style="animation: lineReveal 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) forwards;"
      />
      <!-- Line 2: Eye/brow line -->
      <line
        v-if="lineProgress[1]"
        :x1="lineGuides.line2.x1" :y1="lineGuides.line2.y1"
        :x2="lineGuides.line2.x2" :y2="lineGuides.line2.y2"
        stroke="#E45B3C"
        stroke-opacity="0.6"
        stroke-width="1.5"
        class="line-anim"
        style="animation: lineReveal 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) forwards; animation-delay: 0ms;"
      />
      <!-- Line 3: Nose line -->
      <line
        v-if="lineProgress[2]"
        :x1="lineGuides.line3.x1" :y1="lineGuides.line3.y1"
        :x2="lineGuides.line3.x2" :y2="lineGuides.line3.y2"
        stroke="#E45B3C"
        stroke-opacity="0.6"
        stroke-width="1.5"
        class="line-anim"
        style="animation: lineReveal 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) forwards; animation-delay: 0ms;"
      />
      <!-- Line 4: Five-eye guide -->
      <line
        v-if="lineProgress[3]"
        :x1="lineGuides.line4.x1" :y1="lineGuides.line4.y1"
        :x2="lineGuides.line4.x2" :y2="lineGuides.line4.y2"
        stroke="#E45B3C"
        stroke-opacity="0.5"
        stroke-width="1.5"
        class="line-anim"
        style="animation: lineReveal 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) forwards; animation-delay: 0ms;"
      />
    </svg>
  </div>
</template>

<style scoped>
@keyframes lineReveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.line-anim {
  /* inline stroke attributes */
}
</style>
