<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-full">
    <svg class="w-3.5 h-3.5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
    <span class="text-xs font-medium text-[#475569]">{{ t('hero.privacy_badge') }}</span>
  </div>
</template>
