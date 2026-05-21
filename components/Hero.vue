<script setup lang="ts">
const { t } = useI18n()

function scrollToUpload() {
  document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="px-4 pt-16 pb-12 md:pt-20 md:pb-16">
    <div class="max-w-2xl mx-auto text-center">
      <!-- Title -->
      <h1 class="font-heading text-[32px] md:text-[40px] font-bold text-black tracking-[-0.02em] leading-[1.15]">
        {{ t('hero.title') }}
      </h1>

      <!-- Subtitle -->
      <p class="mt-4 md:mt-4 text-[16px] md:text-[18px] text-muted-fg leading-relaxed max-w-lg mx-auto">
        {{ t('hero.subtitle') }}
      </p>

      <!-- CTA -->
      <div class="mt-8">
        <button
          type="button"
          class="w-full md:w-auto inline-flex items-center justify-center gap-2
                 px-8 py-3.5 bg-coral text-white font-medium text-[15px]
                 rounded-lg
                 transition-colors duration-150 hover:bg-coral-hover
                 active:scale-[0.97] transition-transform duration-100
                 shadow-[0_2px_8px_rgba(228,91,60,0.20)]"
          @click="scrollToUpload"
        >
          {{ t('hero.cta') }}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      <!-- Privacy -->
      <p class="mt-4 flex items-center justify-center gap-1.5 text-[14px] text-muted-fg">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {{ t('hero.privacy') }}
      </p>
    </div>
  </section>
</template>
