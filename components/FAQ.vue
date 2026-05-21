<script setup lang="ts">
const { t } = useI18n()

const openIndex = ref<number | null>(null)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}

const faqItems = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
  { q: 'faq.q6', a: 'faq.a6' },
]
</script>

<template>
  <section class="px-4 pb-24">
    <div class="max-w-2xl mx-auto">
      <h2 class="font-heading text-[24px] font-bold text-black tracking-[-0.02em] text-center mb-8">
        {{ t('faq.heading') }}
      </h2>

      <div class="border-t border-border-light">
        <template v-for="(item, i) in faqItems" :key="i">
          <div class="border-b border-border-light">
            <!-- Question -->
            <button
              type="button"
              class="w-full flex items-center justify-between py-5 text-left
                     font-heading text-[16px] font-semibold text-black
                     hover:text-coral transition-colors duration-150"
              @click="toggle(i)"
            >
              <span>{{ t(item.q) }}</span>
              <svg
                class="w-4 h-4 text-muted-fg shrink-0 ml-4 transition-transform duration-300"
                :class="openIndex === i ? 'rotate-180' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Answer -->
            <div
              class="overflow-hidden transition-all duration-[400ms]"
              :style="{
                maxHeight: openIndex === i ? '500px' : '0px',
                opacity: openIndex === i ? 1 : 0,
              }"
            >
              <p class="text-[15px] text-muted-fg leading-relaxed pb-5 pt-0">
                {{ t(item.a) }}
              </p>
            </div>
          </div>

          <AdSlot v-if="i === 2" position="faq-middle" />
        </template>
      </div>

      <AdSlot position="below-faq" />
    </div>
  </section>
</template>
