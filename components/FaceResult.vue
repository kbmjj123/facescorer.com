<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

export interface FaceScore {
  rawScore: number
  topPercent: number
  label: string
  labelSubtitle: string
  dimensions: Array<{
    name: string
    rank: number
    description: string
    barValue: number
  }>
}

const props = defineProps<{
  score: FaceScore
  visible: boolean
}>()

const { t } = useI18n()

// ── Score counting animation ──
const displayScore = ref(0)
let countFrame: number | null = null
let startTimeout: ReturnType<typeof setTimeout> | null = null

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function animateCount(target: number) {
  if (countFrame) cancelAnimationFrame(countFrame)
  displayScore.value = 0

  const duration = 1200
  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const raw = Math.min(elapsed / duration, 1)
    const eased = easeOut(raw)
    displayScore.value = Math.round(eased * target)

    if (raw < 1) {
      countFrame = requestAnimationFrame(tick)
    } else {
      displayScore.value = target
    }
  }

  countFrame = requestAnimationFrame(tick)
}

const started = ref(false)

watch(() => props.visible, (v) => {
  if (v && !started.value) {
    started.value = true
    startTimeout = setTimeout(() => {
      animateCount(props.score.rawScore)
    }, 100)
  }
})

onBeforeUnmount(() => {
  if (countFrame) cancelAnimationFrame(countFrame)
  if (startTimeout) clearTimeout(startTimeout)
})
</script>

<template>
  <section
    v-if="visible"
    class="px-4 pb-20"
    :style="{
      animation: 'fadeSlideUp 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) forwards',
    }"
  >
    <div class="max-w-4xl mx-auto">
      <div class="lg:flex lg:gap-12 lg:items-start">
        <!-- Score block -->
        <div class="lg:w-[420px] lg:shrink-0 mb-8 lg:mb-0">
          <p class="text-[11px] font-semibold text-coral uppercase tracking-[0.12em] mb-3">
            {{ t('result.title') }}
          </p>

          <!-- Big number -->
          <div class="flex items-baseline gap-1 mb-1">
            <span
              class="font-heading text-[48px] md:text-[56px] font-bold text-coral tabular-nums tracking-[-0.03em] leading-none"
            >{{ displayScore }}</span>
            <span class="text-[18px] text-muted-fg font-medium">/ 100</span>
          </div>

          <!-- Ranking -->
          <p class="text-[16px] md:text-[18px] font-medium text-black mt-1">
            {{ t('result.top_percent', { n: score.topPercent }) }} {{ t('result.globally') }}
          </p>

          <!-- Divider -->
          <div class="border-t border-border my-5" />

          <!-- Label -->
          <h2 class="font-heading text-[22px] font-semibold text-black tracking-[-0.01em]">
            &ldquo;{{ score.label }}&rdquo;
          </h2>

          <!-- Label subtitle -->
          <p class="mt-2 text-[15px] text-muted-fg leading-relaxed">
            {{ score.labelSubtitle }}
          </p>

          <!-- Disclaimer -->
          <p class="mt-5 text-[11px] text-muted-fg italic">
            Based on geometric proportions, for reference only.
          </p>
        </div>

        <!-- Dimension cards -->
        <div class="flex-1 min-w-0 space-y-3">
          <DimensionCard
            v-for="(dim, i) in score.dimensions"
            :key="i"
            :name="dim.name"
            :rank="dim.rank"
            :description="dim.description"
            :bar-value="dim.barValue"
            :delay="i * 80"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
