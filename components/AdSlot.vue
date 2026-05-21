<script setup lang="ts">
defineProps<{
  position: string
}>()

const config = useRuntimeConfig()
const publisher = computed(() => config.public.adsensePublisher)

const slotId = computed(() => {
  // Map positions to ad slot IDs (configured in AdSense dashboard)
  const slots: Record<string, string> = {
    'faq-middle': 'facescorer-faq-middle',
    'below-faq': 'facescorer-below-faq',
    'below-share': 'facescorer-below-share',
  }
  return slots[props.position] || ''
})
</script>

<template>
  <div v-if="publisher" class="my-4 flex justify-center">
    <ins
      class="adsbygoogle"
      style="display:block; min-height:120px"
      :data-ad-client="publisher"
      :data-ad-slot="slotId"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  </div>
</template>
