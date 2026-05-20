import { defineStore } from 'pinia'

export interface CardResult {
  id: string
  thumbnailUrl: string
  status: 'pending' | 'processing' | 'done' | 'error'
  confidence: number
  fields: CardFields
  fieldConfidence: Record<string, number>
  edited: boolean
}

export interface CardFields {
  name: string
  firstName: string
  lastName: string
  company: string
  title: string
  phone: string
  email: string
  website: string
  address: string
  notes: string
}

function emptyFields(): CardFields {
  return {
    name: '', firstName: '', lastName: '',
    company: '', title: '', phone: '',
    email: '', website: '', address: '', notes: '',
  }
}

export const useCardsStore = defineStore('cards', () => {
  const cards = ref<CardResult[]>([])
  const selectedIds = ref<Set<string>>(new Set())

  const doneCards = computed(() => cards.value.filter(c => c.status === 'done'))
  const selectedCards = computed(() => cards.value.filter(c => selectedIds.value.has(c.id)))

  function addCard(id: string, thumbnailUrl: string) {
    cards.value.push({
      id,
      thumbnailUrl,
      status: 'pending',
      confidence: 0,
      fields: emptyFields(),
      fieldConfidence: {},
      edited: false,
    })
  }

  function updateStatus(id: string, status: CardResult['status']) {
    const card = cards.value.find(c => c.id === id)
    if (card) card.status = status
  }

  function updateFields(id: string, fields: Partial<CardFields>, confidence: Record<string, number> = {}) {
    const card = cards.value.find(c => c.id === id)
    if (card) {
      Object.assign(card.fields, fields)
      Object.assign(card.fieldConfidence, confidence)
      card.status = 'done'
    }
  }

  function removeCard(id: string) {
    cards.value = cards.value.filter(c => c.id !== id)
    selectedIds.value.delete(id)
  }

  function removeSelected() {
    cards.value = cards.value.filter(c => !selectedIds.value.has(c.id))
    selectedIds.value.clear()
  }

  function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  function selectAll() {
    cards.value.forEach(c => selectedIds.value.add(c.id))
  }

  function clearSelection() {
    selectedIds.value.clear()
  }

  function reset() {
    cards.value = []
    selectedIds.value.clear()
  }

  return {
    cards,
    selectedIds,
    doneCards,
    selectedCards,
    addCard,
    updateStatus,
    updateFields,
    removeCard,
    removeSelected,
    toggleSelect,
    selectAll,
    clearSelection,
    reset,
  }
})
