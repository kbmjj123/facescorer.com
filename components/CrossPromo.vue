<script setup lang="ts">
const props = withDefaults(defineProps<{
  mode?: 'age' | 'face'
}>(), {
  mode: 'face',
})

const { t } = useI18n()

const linkTarget = computed(() => props.mode === 'face' ? '/age' : '/')
const i18nPrefix = computed(() => props.mode === 'face' ? 'cross_promo' : 'age.cross_promo')
</script>

<template>
  <section class="px-4 pb-16">
    <NuxtLink
      :to="linkTarget"
      class="block max-w-2xl mx-auto bg-white border border-border rounded-xl
             px-6 py-6 text-center
             hover:border-coral/30 hover:shadow-elevated
             transition-all duration-300 group"
    >
      <p class="text-[12px] font-semibold text-muted-fg uppercase tracking-[0.12em] mb-2">
        {{ t(`${i18nPrefix}.label`) }}
      </p>
      <p class="font-heading text-[20px] font-semibold text-black tracking-[-0.01em] mb-2
                group-hover:text-coral transition-colors duration-150">
        {{ t(`${i18nPrefix}.text`) }}
      </p>
      <span class="text-[15px] font-medium text-coral
                   group-hover:underline transition-all duration-150">
        {{ t(`${i18nPrefix}.cta`) }}
      </span>
    </NuxtLink>
  </section>
</template>
