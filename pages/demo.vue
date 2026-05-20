<script setup lang="ts">
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

useHead({ title: 'FaceScorer — Demo' })

const step = ref<'upload' | 'analyzing' | 'result'>('result')

const dimensions = [
  { name: 'Bilateral Symmetry', percentile: 12, score: 91, highlight: true },
  { name: 'Eye Spacing Ratio', percentile: 9, score: 94, highlight: true },
  { name: 'Jaw Contour', percentile: 45, score: 72, highlight: false },
]

function cycleStep() {
  if (step.value === 'upload') step.value = 'analyzing'
  else if (step.value === 'analyzing') step.value = 'result'
  else step.value = 'upload'
}
</script>

<template>
  <div class="min-h-screen bg-cream font-body text-black">
    <!-- Nav -->
    <header class="sticky top-0 z-20 bg-cream/90 backdrop-blur-md border-b border-border">
      <nav class="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <span class="text-[17px] font-extrabold tracking-[-0.03em]">
          FaceScorer
        </span>
        <div class="flex items-center gap-5">
          <NuxtLink :to="switchLocalePath(locale === 'en' ? 'zh' : 'en')"
            class="text-[13px] font-medium text-muted-fg hover:text-black transition-colors duration-150">
            {{ locale === 'en' ? '中文' : 'English' }}
          </NuxtLink>
          <NuxtLink to="/age"
            class="text-[13px] font-semibold text-coral hover:text-coral-hover transition-colors duration-150">
            Age Detector
          </NuxtLink>
        </div>
      </nav>
    </header>

    <!-- Step toggle -->
    <div class="flex justify-center pt-4 pb-2">
      <button @click="cycleStep"
        class="text-[11px] font-semibold text-muted-fg hover:text-coral transition-colors duration-150
               border border-border rounded-full px-4 py-1.5">
        {{ step === 'upload' ? 'Upload' : step === 'analyzing' ? 'Analyzing' : 'Result' }}
      </button>
    </div>

    <!-- ========== HERO ========== -->
    <section class="px-5 pt-24 pb-16 md:pt-36 md:pb-24">
      <div class="max-w-2xl mx-auto text-center">
        <p class="text-[13px] font-semibold text-coral uppercase tracking-[0.12em] mb-6">
          100% Private · No Uploads
        </p>

        <h1 class="text-display md:text-[64px] font-extrabold leading-[1.02] tracking-[-0.04em]">
          Your face,<br>
          <span class="text-coral">measured.</span>
        </h1>

        <p class="mt-6 text-[17px] text-muted-fg max-w-sm mx-auto leading-relaxed">
          AI analyzes your facial geometry in the browser.
          No uploads. No servers. Just numbers.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-coral text-white
                         font-semibold text-[15px] rounded-full
                         hover:bg-coral-hover active:scale-[0.97]
                         transition-all duration-150 shadow-[0_2px_12px_rgba(228,91,60,0.25)]">
            Analyze Your Face
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button class="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-border
                         text-black font-semibold text-[15px] rounded-full
                         hover:bg-white active:scale-[0.97]
                         transition-all duration-150">
            Age Detector
          </button>
        </div>
      </div>
    </section>

    <!-- ========== UPLOAD ========== -->
    <section v-if="step === 'upload'" class="px-5 pb-24">
      <div class="max-w-lg mx-auto">
        <div class="bg-white rounded-xl border border-border shadow-card p-12 md:p-16 text-center">
          <div class="w-16 h-16 rounded-2xl bg-coral-light flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-[20px] font-bold text-black tracking-[-0.02em] mb-1">
            Drop your photo here
          </p>
          <p class="text-[14px] text-muted-fg mb-8">Or tap below — selfie or gallery</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button class="w-full sm:w-auto px-6 py-3.5 bg-black text-white font-semibold text-[14px] rounded-full
                           hover:bg-[#333] active:scale-[0.97] transition-all duration-150">
              Choose Photo
            </button>
            <button class="w-full sm:w-auto px-6 py-3.5 border border-border text-black font-semibold text-[14px]
                           rounded-full hover:bg-cream active:scale-[0.97] transition-all duration-150">
              Take Selfie
            </button>
          </div>
          <p class="mt-6 text-[12px] text-muted-fg">JPG · PNG · HEIC · WEBP · Max 10MB</p>
        </div>
      </div>
    </section>

    <!-- ========== ANALYZING ========== -->
    <section v-if="step === 'analyzing'" class="px-5 pb-24">
      <div class="max-w-lg mx-auto">
        <div class="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div class="aspect-square bg-cream flex items-center justify-center">
            <div class="relative w-[55%] max-w-[280px] aspect-[3/4]">
              <svg viewBox="0 0 200 266" class="w-full h-full">
                <ellipse cx="100" cy="130" rx="70" ry="92" fill="none" stroke="#1A1817" stroke-width="1.5" opacity="0.25"/>
                <circle cx="78" cy="115" r="2.2" fill="#E45B3C" opacity="0.6"/>
                <circle cx="122" cy="115" r="2.2" fill="#E45B3C" opacity="0.6"/>
                <circle cx="100" cy="140" r="2" fill="#E45B3C" opacity="0.5"/>
                <circle cx="88" cy="168" r="1.8" fill="#E45B3C" opacity="0.4"/>
                <circle cx="112" cy="168" r="1.8" fill="#E45B3C" opacity="0.4"/>
                <circle cx="100" cy="220" r="1.8" fill="#E45B3C" opacity="0.3"/>
                <line x1="100" y1="30" x2="100" y2="228" stroke="#E45B3C" stroke-width="0.5" stroke-dasharray="4,8" opacity="0.3"/>
              </svg>
            </div>
          </div>
          <div class="bg-white border-t border-border px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
              <p class="text-[14px] font-semibold text-black flex-1">Mapping facial landmarks...</p>
              <span class="text-[16px] font-bold text-coral tabular-nums">64%</span>
            </div>
            <div class="mt-3 h-1.5 bg-cream rounded-full overflow-hidden">
              <div class="h-full bg-coral rounded-full transition-all duration-500 ease-out" style="width:64%" />
            </div>
          </div>
        </div>
        <p class="text-center text-[13px] text-muted-fg mt-4">Computing geometry · about 2s</p>
      </div>
    </section>

    <!-- ========== RESULT ========== -->
    <section v-if="step === 'result'" class="px-5 pb-24">
      <div class="max-w-5xl mx-auto">
        <div class="lg:flex lg:gap-16">
          <!-- Left: photo -->
          <div class="lg:w-[420px] lg:flex-shrink-0 mb-8 lg:mb-0">
            <div class="sticky top-20 bg-white rounded-xl border border-border shadow-card overflow-hidden">
              <div class="aspect-square bg-cream flex items-center justify-center">
                <div class="relative w-[55%] max-w-[280px] aspect-[3/4]">
                  <svg viewBox="0 0 200 266" class="w-full h-full">
                    <ellipse cx="100" cy="130" rx="70" ry="92" fill="#F5F0EB" stroke="#1A1817" stroke-width="1.5" opacity="0.3"/>
                    <ellipse cx="100" cy="72" rx="74" ry="56" fill="#EDE6DD" stroke="#1A1817" stroke-width="1.2" opacity="0.2"/>
                    <line x1="100" y1="30" x2="100" y2="228" stroke="#E45B3C" stroke-width="0.6" stroke-dasharray="4,8" opacity="0.35"/>
                    <line x1="28" y1="82" x2="172" y2="82" stroke="#E45B3C" stroke-width="0.4" stroke-dasharray="6,6" opacity="0.2"/>
                    <line x1="28" y1="148" x2="172" y2="148" stroke="#E45B3C" stroke-width="0.4" stroke-dasharray="6,6" opacity="0.2"/>
                    <rect x="28" y="42" width="144" height="183" rx="3" fill="none" stroke="#1A1817" stroke-width="0.5" opacity="0.1"/>
                    <circle cx="78" cy="118" r="2.5" fill="white" stroke="#E45B3C" stroke-width="1.5"/>
                    <circle cx="122" cy="118" r="2.5" fill="white" stroke="#E45B3C" stroke-width="1.5"/>
                    <circle cx="100" cy="138" r="2.2" fill="white" stroke="#E45B3C" stroke-width="1.3"/>
                    <circle cx="88" cy="168" r="2.2" fill="white" stroke="#E45B3C" stroke-width="1.3"/>
                    <circle cx="112" cy="168" r="2.2" fill="white" stroke="#E45B3C" stroke-width="1.3"/>
                    <circle cx="100" cy="220" r="2" fill="white" stroke="#E45B3C" stroke-width="1.2"/>
                    <circle cx="62" cy="195" r="1.8" fill="white" stroke="#E45B3C" stroke-width="1"/>
                    <circle cx="138" cy="195" r="1.8" fill="white" stroke="#E45B3C" stroke-width="1"/>
                    <rect x="52" y="95" width="14" height="5" rx="0" fill="#1A1817" opacity="0.4"/>
                    <rect x="134" y="95" width="14" height="5" rx="0" fill="#1A1817" opacity="0.4"/>
                    <line x1="100" y1="125" x2="100" y2="145" stroke="#1A1817" stroke-width="1.2" opacity="0.3"/>
                    <path d="M88 168c5 3 8 2 12 0" stroke="#1A1817" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: results -->
          <div class="flex-1 min-w-0">
            <!-- Score -->
            <div class="mb-10">
              <p class="text-[12px] font-semibold text-coral uppercase tracking-[0.12em] mb-4">Your Analysis</p>

              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-score font-extrabold text-black tabular-nums tracking-[-0.05em]">84</span>
                <span class="text-[22px] font-medium text-muted-fg">/ 100</span>
              </div>

              <p class="text-[22px] font-bold text-coral tracking-[-0.02em] mb-6">
                Top 12% globally
              </p>

              <span class="inline-flex items-center gap-2 bg-coral-light text-coral font-bold text-[15px] px-4 py-2 rounded-full">
                <span class="w-2 h-2 bg-coral rounded-full" />
                &ldquo;Harmonious Symmetry&rdquo;
              </span>
            </div>

            <!-- Dimension cards -->
            <div class="space-y-3">
              <div v-for="(dim, i) in dimensions" :key="i"
                class="bg-white rounded-xl border border-border shadow-card p-5
                       hover:shadow-elevated transition-shadow duration-300 animate-slide-up"
                :style="{ animationDelay: `${i * 60}ms` }">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-2.5 h-2.5 rounded-full" :class="dim.highlight ? 'bg-coral' : 'bg-[#D5CFC8]'" />
                    <h3 class="text-[17px] font-bold text-black tracking-[-0.01em]">{{ dim.name }}</h3>
                  </div>
                  <span class="text-[18px] font-bold text-coral tabular-nums tracking-[-0.02em]">
                    {{ dim.percentile }}%
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 bg-cream rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700 ease-out"
                         :class="dim.highlight ? 'bg-coral' : 'bg-[#D5CFC8]'"
                         :style="{ width: `${dim.score}%` }" />
                  </div>
                  <span class="text-[13px] font-semibold text-muted-fg tabular-nums w-16 text-right">
                    {{ dim.score }}<span class="text-[11px]">/100</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== SHARE CARD ========== -->
        <div class="mt-20 pt-14 border-t border-border">
          <div class="text-center mb-10">
            <p class="text-[11px] font-semibold text-coral uppercase tracking-[0.12em] mb-2">Share</p>
            <h2 class="text-[28px] font-extrabold text-black tracking-[-0.03em]">Your Result Card</h2>
          </div>

          <div class="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div class="relative w-[220px] aspect-[9/16] rounded-2xl overflow-hidden shadow-elevated flex-shrink-0"
                 style="background: linear-gradient(170deg, #FCFAF7 0%, #FFF0EC 30%, #E45B3C 100%);">
              <div class="absolute top-[8%] left-[10%] right-[10%] aspect-[3/4] rounded-xl bg-white/80 flex items-center justify-center">
                <svg viewBox="0 0 200 266" class="w-4/5 h-4/5 opacity-50">
                  <ellipse cx="100" cy="135" rx="60" ry="80" fill="#F5F0EB"/>
                </svg>
              </div>
              <div class="absolute top-[58%] left-0 right-0 text-center px-4">
                <p class="text-white text-[14px] font-bold tracking-[-0.01em]">&ldquo;Harmonious Symmetry&rdquo;</p>
              </div>
              <div class="absolute top-[72%] left-0 right-0 text-center">
                <p class="text-white text-[36px] font-extrabold tracking-[-0.03em]">TOP 12%</p>
              </div>
              <div class="absolute bottom-[5%] left-0 right-0 text-center">
                <p class="text-white/50 text-[9px] font-semibold tracking-[0.2em]">FACESCORER.COM</p>
              </div>
            </div>

            <div class="flex flex-col gap-3 w-[200px]">
              <button class="w-full py-3 bg-black text-white font-semibold text-[14px] rounded-full
                             hover:bg-[#333] active:scale-[0.97] transition-all duration-150">
                Download PNG
              </button>
              <button class="w-full py-3 border border-border text-black font-semibold text-[14px] rounded-full
                             hover:bg-cream active:scale-[0.97] transition-all duration-150">
                Copy to Clipboard
              </button>
              <button class="w-full py-3 border border-border text-black font-semibold text-[14px] rounded-full
                             hover:bg-cream active:scale-[0.97] transition-all duration-150">
                Share
              </button>
            </div>
          </div>
        </div>

        <!-- ========== CROSS-PROMO ========== -->
        <div class="mt-16 pt-12 border-t border-border">
          <NuxtLink to="/age"
            class="block bg-white rounded-xl border border-border shadow-card p-8 text-center
                   hover:shadow-elevated transition-shadow duration-300 group">
            <p class="text-[13px] font-semibold text-coral mb-2">Also try</p>
            <p class="text-[24px] font-extrabold text-black tracking-[-0.03em]
                      group-hover:text-coral transition-colors duration-150">
              How old does AI think you are?
            </p>
          </NuxtLink>
        </div>

        <!-- ========== FAQ ========== -->
        <div class="mt-16 pt-12 border-t border-border">
          <h2 class="text-[28px] font-extrabold text-black tracking-[-0.03em] text-center mb-8">FAQ</h2>
          <div class="max-w-2xl mx-auto space-y-2.5">
            <details v-for="(q, i) in ['How does the AI analyze my face?','Where does my photo go?','Is this a real attractiveness score?']" :key="i"
              class="bg-white rounded-xl border border-border shadow-card group">
              <summary class="px-6 py-4 cursor-pointer list-none flex items-center justify-between
                              text-[15px] font-semibold text-black hover:text-coral transition-colors duration-150">
                {{ q }}
                <svg class="w-4 h-4 text-muted-fg transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div class="px-6 pb-5 text-[14px] text-muted-fg leading-relaxed">
                <template v-if="i===0">
                  478 facial landmarks detected by MediaPipe. Geometry calculated in your browser — symmetry, golden ratio, facial thirds. No photo ever leaves your device.
                </template>
                <template v-else-if="i===1">
                  Nowhere. All processing is local. Open source (Apache 2.0) — anyone can audit this claim.
                </template>
                <template v-else>
                  No. We measure 7 geometric dimensions, weighted into 60–99. For reference only. Real beauty isn't a number.
                </template>
              </div>
            </details>
          </div>
        </div>

        <footer class="mt-16 pt-8 pb-12 border-t border-border text-center">
          <p class="text-[12px] text-muted-fg">FaceScorer · Open Source · All AI runs locally in your browser</p>
        </footer>
      </div>
    </section>
  </div>
</template>
