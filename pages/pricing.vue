<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const plans = [
  { key: 'one_time', price: '$4.9', desc: '100 cards, never expires', url: config.public.lsOneTime },
  { key: 'monthly', price: '$9', desc: 'Unlimited scans / month', url: config.public.lsMonthly },
  { key: 'yearly', price: '$79', desc: 'Unlimited scans / year', url: config.public.lsYearly },
]
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-body">
    <!-- Nav -->
    <header class="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur border-b border-border">
      <nav class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-heading font-semibold text-[#0F172A]">CardScan</span>
        </NuxtLink>
      </nav>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-5xl font-heading font-bold text-[#0F172A]">
          {{ t('modal.upgrade.title') }}
        </h1>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <a
          v-for="plan in plans"
          :key="plan.key"
          :href="plan.url"
          class="card-surface p-6 text-center hover:shadow-card-hover hover:border-accent/30 transition-all duration-200 group"
        >
          <p class="text-2xl font-heading font-bold text-[#0F172A]">{{ plan.price }}</p>
          <p class="mt-2 text-sm text-muted-foreground">{{ plan.desc }}</p>
          <span class="inline-block mt-4 px-4 py-2 bg-accent text-white font-semibold rounded-button text-sm
                       group-hover:bg-accent-hover transition-colors">
            Get Started
          </span>
        </a>
      </div>
    </main>
  </div>
</template>
