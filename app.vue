<script setup lang="ts">
const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

useHead({
  title: t('meta.title'),
  htmlAttrs: { lang: locale },
  meta: [
    { name: 'description', content: t('meta.description') },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-body">
    <NuxtPage />
  </div>
</template>
