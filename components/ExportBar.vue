<script setup lang="ts">
const { t } = useI18n()
const cardsStore = useCardsStore()
const { exportCSV, exportVCard, exportExcel } = useExport()
const { requirePaid } = useQuota()

const emit = defineEmits<{
  upgrade: [trigger: string]
}>()

const showConfirm = ref<string | null>(null)
const lastFilename = ref('')

const targetCards = computed(() =>
  cardsStore.selectedIds.size > 0
    ? cardsStore.selectedCards
    : cardsStore.doneCards,
)

const count = computed(() => targetCards.value.length)

function handleExport(format: string) {
  if (count.value === 0) return

  if (format === 'excel') {
    const paid = requirePaid('excel-export', () => {
      doExport(format)
    })
    if (!paid) {
      emit('upgrade', 'excel-export')
      return
    }
  } else {
    doExport(format)
  }
}

async function doExport(format: string) {
  const cards = targetCards.value
  let filename = ''

  switch (format) {
    case 'csv':
      filename = exportCSV(cards)
      break
    case 'vcf':
      filename = exportVCard(cards)
      break
    case 'excel':
      filename = await exportExcel(cards)
      break
  }

  lastFilename.value = filename
  showConfirm.value = null
}
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-[#E2E8F0] pb-safe">
    <div class="max-w-2xl mx-auto px-4 py-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex-1 py-2.5 text-sm font-medium text-[#1E3A5F] bg-muted rounded-button
                 hover:bg-[#E2E8F0] transition-colors duration-200 disabled:opacity-40"
          :disabled="count === 0"
          @click="handleExport('csv')"
        >
          {{ t('export.csv') }}
        </button>

        <button
          type="button"
          class="flex-1 py-2.5 text-sm font-medium text-[#1E3A5F] bg-muted rounded-button
                 hover:bg-[#E2E8F0] transition-colors duration-200 disabled:opacity-40"
          :disabled="count === 0"
          @click="handleExport('vcf')"
        >
          {{ t('export.vcf') }}
        </button>

        <button
          type="button"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-accent rounded-button
                 hover:bg-accent-hover transition-colors duration-200 disabled:opacity-40"
          :disabled="count === 0"
          @click="handleExport('excel')"
        >
          {{ t('export.excel') }}
        </button>
      </div>
    </div>
  </div>
</template>
