<script setup lang="ts">
const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

const { scanFiles, scanning, modelLoaded, modelError } = useCardScanner()
const { activatePlan } = useQuota()

useHead({
  title: t('meta.title'),
  htmlAttrs: { lang: locale.value },
  meta: [
    { name: 'description', content: t('meta.description') },
  ],
})

// Payment return URL handling
const showUpgradeModal = ref(false)
const upgradeTrigger = ref('')

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('payment') === 'success') {
    const plan = params.get('plan')
    if (plan === 'one-time' || plan === 'monthly' || plan === 'yearly') {
      activatePlan(plan)
    }
    router.replace({ query: {} })
  }
})

function handleStartScan(files: File[]) {
  scanFiles(files)
}

function handleUpgradeRequest(trigger: string) {
  upgradeTrigger.value = trigger
  showUpgradeModal.value = true
}

const showHero = computed(() => !scanning.value && !modelError.value)
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-body">
    <!-- Nav -->
    <header class="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur border-b border-border">
      <nav class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-heading font-semibold text-[#0F172A] text-base">
            CardScan
          </span>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            :to="switchLocalePath(locale === 'en' ? 'zh' : 'en')"
            class="text-xs font-medium text-muted-foreground hover:text-[#0F172A] transition-colors"
          >
            {{ t('nav.lang_toggle') }}
          </NuxtLink>

          <NuxtLink
            to="/pricing"
            class="text-xs font-medium text-[#1E3A5F] hover:text-primary-light transition-colors"
          >
            {{ t('nav.pricing') }}
          </NuxtLink>
        </div>
      </nav>
    </header>

    <!-- Model Loading -->
    <ModelLoader />

    <!-- Hero (shown when no scanning) -->
    <section v-if="showHero" class="px-4 pt-12 pb-8 md:pt-20 md:pb-12">
      <div class="max-w-2xl mx-auto text-center">
        <PrivacyBadge class="mb-6" />

        <h1 class="text-3xl md:text-5xl font-heading font-bold text-[#0F172A] leading-tight tracking-tight">
          {{ t('hero.title') }}
          <span class="text-accent">{{ t('hero.title_highlight') }}</span>
        </h1>

        <p class="mt-4 text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {{ t('hero.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Upload Zone -->
    <section class="pt-4 pb-8">
      <UploadZone @start="handleStartScan" />
    </section>

    <!-- Results -->
    <ResultList />

    <!-- Export Bar (fixed bottom) -->
    <ExportBar @upgrade="handleUpgradeRequest" />

    <!-- Upgrade Modal -->
    <UpgradeModal
      :open="showUpgradeModal"
      :trigger="upgradeTrigger"
      @close="showUpgradeModal = false"
    />
  </div>
</template>
