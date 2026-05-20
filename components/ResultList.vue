<script setup lang="ts">
const cardsStore = useCardsStore()
const { t } = useI18n()

const allSelected = computed(() =>
  cardsStore.cards.length > 0 && cardsStore.cards.every(c => cardsStore.selectedIds.has(c.id)),
)
</script>

<template>
  <div v-if="cardsStore.cards.length > 0" class="w-full px-4 pb-24 md:pb-8">
    <div class="max-w-2xl mx-auto">
      <!-- Selection bar -->
      <div class="flex items-center justify-between mb-4 py-2">
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-sm text-[#475569] cursor-pointer select-none">
            <input
              type="checkbox"
              :checked="allSelected"
              class="w-4 h-4 rounded border-[#CBD5E1] text-accent focus:ring-accent/20"
              @change="allSelected ? cardsStore.clearSelection() : cardsStore.selectAll()"
            >
            {{ cardsStore.selectedIds.size }} / {{ cardsStore.cards.length }}
          </label>

          <button
            v-if="cardsStore.selectedIds.size > 0"
            type="button"
            class="text-xs font-medium text-destructive hover:text-red-700 transition-colors"
            @click="cardsStore.removeSelected()"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>

      <!-- Result cards -->
      <div class="space-y-3">
        <CardResult
          v-for="card in cardsStore.cards"
          :key="card.id"
          :card="card"
        />
      </div>

      <!-- Empty after all deleted -->
      <div v-if="cardsStore.cards.length === 0" class="text-center py-12">
        <p class="text-muted-foreground text-sm">No cards</p>
      </div>
    </div>
  </div>
</template>
