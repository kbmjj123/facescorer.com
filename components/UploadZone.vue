<script setup lang="ts">
const { t } = useI18n()
const { canScan, getUsed, freeLimit } = useQuota()

const emit = defineEmits<{
  start: [files: File[]]
}>()

const files = ref<File[]>([])
const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)

const MAX_FILES = 20
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const used = computed(() => getUsed())
const remaining = computed(() => Math.max(0, freeLimit - used.value))

const previews = computed(() =>
  files.value.map(f => ({
    file: f,
    url: URL.createObjectURL(f),
    size: formatSize(f.size),
  }))
)

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function handleDrop(e: DragEvent) {
  dragging.value = false
  const dropped = e.dataTransfer?.files
  if (dropped) addFiles(Array.from(dropped))
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) addFiles(Array.from(target.files))
  target.value = ''
}

function addFiles(newFiles: File[]) {
  const valid = newFiles.filter(f => {
    if (f.size > MAX_SIZE) return false
    const ext = f.name.split('.').pop()?.toLowerCase()
    return ext && ['jpg', 'jpeg', 'png', 'heic', 'webp'].includes(ext)
  })

  const remaining_slots = MAX_FILES - files.value.length
  const toAdd = valid.slice(0, remaining_slots)

  if (toAdd.length < newFiles.length) {
    // Some files were filtered out — could show a toast here
  }

  files.value = [...files.value, ...toAdd]
}

function removeFile(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
}

function handleStart() {
  if (!canScan(files.value.length)) return
  emit('start', [...files.value])
}

function triggerFileInput() {
  fileInput.value?.click()
}

function triggerCamera() {
  cameraInput.value?.click()
}
</script>

<template>
  <div class="w-full px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Drop Zone -->
      <div
        class="relative card-surface p-6 md:p-10 transition-all duration-200"
        :class="[
          dragging
            ? 'border-primary ring-2 ring-primary/20 bg-[#F1F5F9]'
            : 'border-2 border-dashed border-[#CBD5E1] hover:border-[#94A3B8]',
        ]"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="handleDrop"
      >
        <div class="flex flex-col items-center gap-4 text-center">
          <!-- Icon -->
          <div class="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <svg class="w-7 h-7 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div>
            <p class="text-sm font-medium text-[#0F172A]">
              {{ t('upload.hint') }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ t('upload.hint_mobile') }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white font-semibold rounded-button
                     transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] text-sm"
              @click="triggerFileInput"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {{ t('upload.btn_files') }}
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-[#1E3A5F] font-medium
                     rounded-button transition-all duration-200 hover:bg-muted active:scale-[0.98] text-sm"
              @click="triggerCamera"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ t('upload.btn_camera') }}
            </button>
          </div>

          <p class="text-[11px] text-muted-foreground">
            JPG, PNG, HEIC, WEBP · {{ t('upload.quota', { used, limit: freeLimit }) }}
          </p>
        </div>

        <!-- Hidden inputs -->
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/webp"
          multiple
          class="hidden"
          @change="handleFileSelect"
        >
        <input
          ref="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          @change="handleFileSelect"
        >
      </div>

      <!-- Preview Grid -->
      <div v-if="files.length > 0" class="mt-4 space-y-3">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          <div
            v-for="(preview, i) in previews"
            :key="i"
            class="relative group aspect-[1.6/1] rounded-lg overflow-hidden border border-[#E2E8F0] bg-muted"
          >
            <img :src="preview.url" alt="" class="w-full h-full object-cover" loading="lazy">
            <button
              type="button"
              class="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#0F172A]/60 text-white flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-destructive"
              aria-label="Remove"
              @click="removeFile(i)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span class="absolute bottom-1 right-1 text-[10px] text-white/80 bg-[#0F172A]/50 px-1 py-0.5 rounded">
              {{ preview.size }}
            </span>
          </div>
        </div>

        <!-- Start button -->
        <button
          type="button"
          class="w-full py-3 bg-accent text-white font-semibold rounded-button
                 transition-all duration-200 hover:bg-accent-hover active:scale-[0.99]
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canScan(files.length)"
          @click="handleStart"
        >
          {{ t('upload.btn_start', { count: files.length }) }}
        </button>

        <p v-if="!canScan(files.length)" class="text-center text-xs text-[#DC2626]">
          {{ t('upload.limit_reached') }}
        </p>
      </div>
    </div>
  </div>
</template>
