<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()

useHead({
  title: t('error.title'),
})

function handleClear() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-body flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <p class="text-6xl font-heading font-bold text-[#CBD5E1] mb-4">
        {{ error.statusCode }}
      </p>
      <h1 class="text-xl font-heading font-semibold text-[#0F172A] mb-2">
        {{ error.statusMessage || t('error.default_title') }}
      </h1>
      <p class="text-sm text-muted-foreground mb-8">
        {{ error.message || t('error.default_message') }}
      </p>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-button
               transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] text-sm"
        @click="handleClear"
      >
        {{ t('error.back_home') }}
      </button>
    </div>
  </div>
</template>
