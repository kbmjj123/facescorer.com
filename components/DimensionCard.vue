<script setup lang="ts">
defineProps<{
  name: string
  rank: number
  description: string
  barValue: number
  delay: number // ms
}>()
</script>

<template>
  <div
    class="bg-white border border-border rounded-xl shadow-card p-5 md:p-6"
    :style="{
      animation: `slideUp 300ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) forwards`,
      animationDelay: `${delay}ms`,
      opacity: 0,
      transform: 'translateY(16px)',
    }"
  >
    <!-- Header: name + rank -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-heading text-[16px] font-semibold text-black tracking-[-0.01em]">
        {{ name }}
      </h3>
      <span class="text-[15px] font-semibold text-coral tabular-nums shrink-0">
        Top {{ rank }}%
      </span>
    </div>

    <!-- Separator -->
    <div class="border-b border-border-light mb-3" />

    <!-- Description -->
    <p class="text-[14px] text-muted-fg leading-relaxed mb-3">
      {{ description }}
    </p>

    <!-- Progress bar -->
    <div class="flex items-center gap-3">
      <div class="flex-1 h-[3px] bg-cream rounded-full overflow-hidden">
        <div
          class="h-full bg-coral rounded-full"
          :style="{
            width: `${barValue}%`,
            transition: 'width 800ms var(--ease-out, cubic-bezier(0.16,1,0.3,1))',
          }"
        />
      </div>
      <span class="text-[12px] text-muted-fg tabular-nums shrink-0 text-right w-16">
        {{ barValue }} / 100
      </span>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
