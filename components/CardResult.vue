<script setup lang="ts">
import type { CardResult } from '~/stores/cards'

const { t } = useI18n()
const cardsStore = useCardsStore()

const props = defineProps<{
  card: CardResult
}>()

const editingField = ref<string | null>(null)
const editValue = ref('')
const confirmingDelete = ref(false)

const fieldKeys: Array<{ key: string; i18nKey: string }> = [
  { key: 'name', i18nKey: 'card.field.name' },
  { key: 'company', i18nKey: 'card.field.company' },
  { key: 'title', i18nKey: 'card.field.title' },
  { key: 'phone', i18nKey: 'card.field.phone' },
  { key: 'email', i18nKey: 'card.field.email' },
  { key: 'website', i18nKey: 'card.field.website' },
  { key: 'address', i18nKey: 'card.field.address' },
  { key: 'notes', i18nKey: 'card.field.notes' },
]

function confidenceClass(field: string): string {
  const conf = props.card.fieldConfidence[field]
  if (conf === undefined) return ''
  if (conf >= 0.8) return 'confidence-high'
  if (conf >= 0.5) return 'confidence-medium'
  return 'confidence-low'
}

function confidenceLabel(field: string): string | null {
  const conf = props.card.fieldConfidence[field]
  if (conf === undefined || conf >= 0.8) return null
  return t('card.confidence_low')
}

function getField(key: string): string {
  const fields = props.card.fields as unknown as Record<string, string>
  return fields[key] ?? ''
}

function startEdit(key: string) {
  editingField.value = key
  editValue.value = getField(key)
}

function saveEdit() {
  if (editingField.value) {
    const fields = { [editingField.value]: editValue.value }
    cardsStore.updateFields(props.card.id, fields)
    cardsStore.cards.find(c => c.id === props.card.id)!.edited = true
  }
  editingField.value = null
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') saveEdit()
  if (e.key === 'Escape') editingField.value = null
}

function handleDelete() {
  if (confirmingDelete.value) {
    cardsStore.removeCard(props.card.id)
  } else {
    confirmingDelete.value = true
  }
}

function cancelDelete() {
  confirmingDelete.value = false
}

const isProcessing = computed(() => props.card.status === 'processing')
const isError = computed(() => props.card.status === 'error')
const isDone = computed(() => props.card.status === 'done')
const isPending = computed(() => props.card.status === 'pending')
</script>

<template>
  <div
    class="card-surface overflow-hidden animate-slide-up"
    :class="[
      isDone ? confidenceClass('name') : '',
      isError && 'border-destructive/40 bg-red-50/50',
    ]"
  >
    <!-- Status Header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-[#F1F5F9]">
      <!-- Thumbnail -->
      <div class="w-[60px] h-[40px] rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img
          v-if="card.thumbnailUrl"
          :src="card.thumbnailUrl"
          alt=""
          class="w-full h-full object-cover"
        >
        <div v-else class="w-full h-full flex items-center justify-center">
          <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <!-- Status indicator -->
          <div v-if="isPending" class="w-2 h-2 rounded-full bg-[#94A3B8]" />
          <div v-else-if="isProcessing" class="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <svg v-else-if="isDone" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="isError" class="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <span class="text-xs font-medium text-[#475569] truncate">
            {{ isPending ? t('card.status.pending') : '' }}
            {{ isProcessing ? t('card.status.processing', { seconds: '...' }) : '' }}
            {{ isDone ? t('card.status.done') : '' }}
            {{ isError ? t('card.status.error') : '' }}
          </span>
        </div>

        <p v-if="isDone && card.fields.name" class="text-sm font-heading font-semibold text-[#0F172A] truncate mt-0.5">
          {{ card.fields.name }}
        </p>
      </div>

      <!-- Delete -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <template v-if="confirmingDelete">
          <button
            type="button"
            class="px-2 py-1 text-[11px] font-medium text-white bg-destructive rounded-md hover:bg-red-700 transition-colors"
            @click="handleDelete"
          >
            {{ t('common.delete') }}
          </button>
          <button
            type="button"
            class="px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-[#0F172A] transition-colors"
            @click="cancelDelete"
          >
            {{ t('common.cancel') }}
          </button>
        </template>
        <button
          v-else
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
          aria-label="Delete card"
          @click="handleDelete"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Fields -->
    <div v-if="isDone || isProcessing" class="px-4 py-3 space-y-1">
      <div
        v-for="f in fieldKeys"
        :key="f.key"
        class="flex items-start gap-2 py-1"
        :class="confidenceClass(f.key)"
      >
        <label class="w-[68px] flex-shrink-0 pt-1.5 text-xs font-medium text-muted-foreground leading-tight">
          {{ t(f.i18nKey) }}
        </label>

        <div class="flex-1 min-w-0 relative">
          <input
            v-if="editingField === f.key"
            :value="editValue"
            type="text"
            class="input-field w-full text-sm"
            @input="editValue = ($event.target as HTMLInputElement).value"
            @blur="saveEdit"
            @keydown="handleKeydown"
          >
          <p
            v-else
            class="text-sm text-[#0F172A] py-1.5 px-3 min-h-[34px] cursor-text rounded-button
                   hover:bg-muted transition-colors truncate"
            :class="{ 'text-muted-foreground italic': !getField(f.key) }"
            tabindex="0"
            role="textbox"
            :aria-label="String(t(f.i18nKey))"
            @click="startEdit(f.key)"
          >
            {{ getField(f.key) || '—' }}
          </p>
          <span
            v-if="confidenceLabel(f.key)"
            class="block mt-0.5 text-[11px] text-amber-600"
          >{{ confidenceLabel(f.key) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
