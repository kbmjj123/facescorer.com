<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  aiAge: number
  visible: boolean
}>()

const emit = defineEmits<{
  retake: []
}>()

const { t } = useI18n()

const realAge = ref('')
const compared = ref(false)
const delta = computed(() => (compared.value ? props.aiAge - parseInt(realAge.value) : 0))
const state = computed<'A' | 'B' | 'C'>(() => {
  if (!compared.value) return 'A'
  return delta.value <= 0 ? 'B' : 'C'
})

function handleCompare() {
  const n = parseInt(realAge.value)
  if (isNaN(n) || n < 13 || n > 100) return
  compared.value = true
}
</script>

<template>
  <section
    v-if="visible"
    class="px-4 pb-20"
    :style="{ animation: 'fadeSlideUp 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) forwards' }"
  >
    <div class="max-w-lg mx-auto bg-white border border-border rounded-xl shadow-card p-8 text-center">

      <!-- State A: no real age -->
      <template v-if="state === 'A'">
        <p class="text-[14px] font-semibold text-muted-fg uppercase tracking-[0.10em] mb-3">
          {{ t('age.result.ai_thinks') }}
        </p>
        <p class="font-heading text-[64px] font-bold text-coral leading-none tabular-nums">
          {{ aiAge }}
        </p>
        <p class="text-[18px] text-muted-fg mt-1 mb-8">{{ t('age.result.years_old') }}</p>

        <div class="flex gap-3 justify-center items-end">
          <div class="text-left">
            <label class="block text-[11px] font-semibold text-muted-fg uppercase tracking-wider mb-1.5">
              {{ t('age.placeholder') }}
            </label>
            <input
              v-model="realAge"
              type="number"
              min="13"
              max="100"
              :placeholder="t('age.placeholder')"
              class="w-full px-4 py-2.5 border border-border rounded-lg text-[15px] text-black
                     focus:border-coral focus:ring-2 focus:ring-coral/15 focus:outline-none
                     transition-colors duration-150"
              @keydown.enter="handleCompare"
            >
          </div>
          <button
            type="button"
            class="px-6 py-2.5 bg-coral text-white font-semibold text-[14px] rounded-lg
                   hover:bg-coral-hover active:scale-[0.97] transition-all duration-150
                   shadow-[0_2px_6px_rgba(228,91,60,0.18)]"
            @click="handleCompare"
          >
            {{ t('age.compare') }}
          </button>
        </div>
      </template>

      <!-- State B: looks younger -->
      <template v-else-if="state === 'B'">
        <p class="font-heading text-[20px] font-semibold text-black mb-1">
          AI: {{ aiAge }} · You: {{ realAge }}
        </p>
        <p class="text-[18px] font-semibold text-green-600 mb-4">
          {{ t('age.result.younger', { delta: Math.abs(delta) }) }}
        </p>
        <div class="w-12 h-1 bg-green-200 rounded-full mx-auto mb-4" />
        <p class="text-[15px] text-muted-fg leading-relaxed">
          {{ t('age.result.younger_reason') }}
        </p>
      </template>

      <!-- State C: looks older -->
      <template v-else>
        <p class="font-heading text-[20px] font-semibold text-black mb-1">
          AI: {{ aiAge }} · You: {{ realAge }}
        </p>
        <p class="text-[18px] font-semibold text-muted-fg mb-4">
          {{ t('age.result.older', { delta: delta }) }}
        </p>
        <div class="w-12 h-1 bg-[#D5CFC0] rounded-full mx-auto mb-4" />
        <p class="text-[15px] text-muted-fg leading-relaxed mb-6">
          {{ t('age.result.older_reason') }}
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-3 border border-border text-black font-semibold
                 text-[14px] rounded-lg hover:bg-cream active:scale-[0.97] transition-all duration-150"
          @click="emit('retake')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ t('age.result.retake') }}
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
