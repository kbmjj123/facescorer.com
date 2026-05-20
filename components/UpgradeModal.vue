<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const props = defineProps<{
  open: boolean
  trigger: string
}>()

const emit = defineEmits<{
  close: []
}>()

function handleUpgrade(plan: 'one-time' | 'monthly' | 'yearly') {
  const urls: Record<string, string> = {
    'one-time': config.public.lsOneTime,
    'monthly': config.public.lsMonthly,
    'yearly': config.public.lsYearly,
  }
  const url = urls[plan]
  if (url) {
    window.location.href = url
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm animate-fade-in"
        @click="emit('close')"
      />

      <!-- Modal -->
      <div
        class="relative w-full md:max-w-md bg-white rounded-t-modal md:rounded-modal shadow-modal
               animate-slide-up max-h-[90vh] overflow-y-auto"
      >
        <!-- Header -->
        <div class="pt-6 px-6 text-center">
          <h2 class="text-xl font-heading font-bold text-[#0F172A]">
            {{ t('modal.upgrade.title') }}
          </h2>
        </div>

        <!-- Plans -->
        <div class="p-6 space-y-3">
          <button
            type="button"
            class="w-full p-4 text-left card-surface hover:border-accent hover:shadow-card-hover transition-all duration-200"
            @click="handleUpgrade('one-time')"
          >
            <p class="text-[15px] font-heading font-semibold text-[#0F172A]">{{ t('modal.upgrade.one_time') }}</p>
          </button>

          <button
            type="button"
            class="w-full p-4 text-left card-surface hover:border-accent hover:shadow-card-hover transition-all duration-200"
            @click="handleUpgrade('monthly')"
          >
            <p class="text-[15px] font-heading font-semibold text-[#0F172A]">{{ t('modal.upgrade.monthly') }}</p>
          </button>

          <button
            type="button"
            class="w-full p-4 text-left card-surface hover:border-accent hover:shadow-card-hover transition-all duration-200
                   ring-2 ring-accent/30"
            @click="handleUpgrade('yearly')"
          >
            <div class="flex items-center justify-between">
              <p class="text-[15px] font-heading font-semibold text-[#0F172A]">{{ t('modal.upgrade.yearly') }}</p>
              <span class="text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">Best value</span>
            </div>
          </button>

          <button
            type="button"
            class="w-full py-2.5 text-sm text-muted-foreground hover:text-[#0F172A] transition-colors"
            @click="emit('close')"
          >
            {{ t('modal.upgrade.dismiss') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
