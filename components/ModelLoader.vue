<script setup lang="ts">
import { useCardScanner } from '~/composables/useCardScanner'

const { t } = useI18n()
const { modelLoaded, modelProgress, modelError, ensureModelsReady } = useCardScanner()

const modelSize = 27

onMounted(() => {
  ensureModelsReady().catch(() => { /* error handled reactively */ })
})
</script>

<template>
  <div v-if="!modelLoaded && !modelError" class="w-full px-4 py-3 animate-fade-in">
    <div class="max-w-lg mx-auto card-surface p-4">
      <div class="flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-[#0F172A] truncate">
            {{ t('model.loading', { size: modelSize }) }}
          </p>
          <div class="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-accent rounded-full transition-all duration-300 ease-out"
              :style="{ width: `${modelProgress}%` }"
            />
          </div>
        </div>
        <span class="text-xs font-medium text-muted-foreground tabular-nums">{{ modelProgress }}%</span>
      </div>
    </div>
  </div>

  <div v-if="modelError" class="w-full px-4 py-3 animate-fade-in">
    <div class="max-w-lg mx-auto card-surface border-destructive/30 bg-red-50 p-4">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-destructive">{{ t('model.error') }}</p>
      </div>
    </div>
  </div>
</template>
