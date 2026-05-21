// Shared photo memory between / and /age so users don't re-upload
const photoBus = ref<{ file: File; dataUrl: string } | null>(null)

export function usePhotoBus() {
  function set(file: File, dataUrl: string) {
    photoBus.value = { file, dataUrl }
  }

  function get() {
    return photoBus.value
  }

  function clear() {
    photoBus.value = null
  }

  return { set, get, clear }
}
