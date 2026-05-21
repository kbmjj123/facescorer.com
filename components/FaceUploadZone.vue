<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  processing: boolean
}>()

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const uploading = computed(() => props.processing)
const previewUrl = ref<string | null>(null)
const currentFile = ref<File | null>(null)

function triggerInput() {
  fileInput.value?.click()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    triggerInput()
  }
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (files.length > 0) startUpload(files[0]!)
  input.value = ''
}

function handleDrop(e: DragEvent) {
  dragging.value = false
  const dropped = e.dataTransfer?.files
  if (dropped && dropped.length > 0) startUpload(dropped[0]!)
}

function startUpload(file: File) {
  currentFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  emit('filesSelected', [file])
}
</script>

<template>
  <section id="upload" class="px-4 pb-20">
    <div class="max-w-lg mx-auto">
      <!-- Drop zone -->
      <div
        role="button"
        tabindex="0"
        class="relative overflow-hidden bg-white border border-border rounded-xl
               transition-all duration-200
               flex items-center justify-center
               h-[200px] md:h-[240px]"
        :class="[
          dragging
            ? 'border-2 border-coral bg-coral-light'
            : uploading
              ? ''
              : 'hover:border-coral hover:bg-coral-light hover:scale-[1.01] duration-300 cursor-pointer',
        ]"
        @click="!uploading && triggerInput()"
        @keydown="!uploading && handleKeydown($event)"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="handleDrop"
      >
        <!-- Default / Hover / Drag — no photo yet -->
        <div
          v-if="!previewUrl"
          class="flex flex-col items-center justify-center text-center px-4"
        >
          <svg class="w-6 h-6"
               :class="dragging ? 'text-coral' : 'text-coral'"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="mt-3 font-heading text-[18px] font-semibold"
             :class="dragging ? 'text-coral' : 'text-black'">
            {{ dragging ? t('upload.drop_hint') : t('upload.title') }}
          </p>
          <p class="mt-1 text-[14px] text-muted-fg">
            {{ t('upload.subtitle') }}
          </p>
        </div>

        <!-- Uploading — photo preview + loading overlay -->
        <template v-if="previewUrl">
          <img
            :src="previewUrl"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
          >
          <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3">
              <!-- Three-dot pulse -->
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 0ms" />
                <span class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 150ms" />
                <span class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 300ms" />
              </div>
              <p class="text-[14px] text-white font-medium">{{ t('upload.analyzing') }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        :capture="'user'"
        class="sr-only"
        @change="handleFileChange"
      >

      <!-- Privacy note -->
      <p class="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted-fg text-center">
        <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {{ t('upload.privacy') }}
      </p>
    </div>
  </section>
</template>
