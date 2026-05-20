import { useCardsStore } from '~/stores/cards'
import { fileToImageData, preprocessForDB, preprocessForCRNN } from '~/utils/imagePreprocess'
import { decodeDBOutput } from '~/utils/dbDecode'
import { ctcGreedyDecodeWithConfidence } from '~/utils/crnnDecode'
import { classifyToFields } from '~/utils/fieldClassifier'
import heic2any from 'heic2any'

export function useCardScanner() {
  const cardsStore = useCardsStore()
  const { loadModels, loaded, loadProgress, loadError, detectText, recognizeText } = useOnnxModel()

  const scanning = ref(false)
  const currentProgress = ref('')

  async function ensureModelsReady() {
    if (!loaded.value) {
      await loadModels()
    }
    if (!loaded.value) {
      throw new Error(loadError.value ?? 'Models failed to load')
    }
  }

  async function scanFiles(files: File[]) {
    if (scanning.value) return
    scanning.value = true

    try {
      await ensureModelsReady()

      for (const file of files) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const thumbnailUrl = URL.createObjectURL(file)
        cardsStore.addCard(id, thumbnailUrl)
        cardsStore.updateStatus(id, 'processing')

        try {
          await processCard(id, file)
        } catch (e) {
          console.error(`Failed to process card ${id}:`, e)
          cardsStore.updateStatus(id, 'error')
        }
      }
    } finally {
      scanning.value = false
      currentProgress.value = ''
    }
  }

  async function processCard(id: string, file: File) {
    // Handle HEIC
    let imageFile: File | Blob = file
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      imageFile = await heic2any({ blob: file, toType: 'image/jpeg' }) as Blob
    }

    currentProgress.value = 'Detecting text regions...'

    // Load image and preprocess for DB
    const { data: imageData } = await fileToImageData(imageFile as File)
    const dbInput = preprocessForDB(imageData)

    // DB detection
    const dbOutput = await detectText(dbInput)
    const boxes = decodeDBOutput(dbOutput, 640, 640)
    currentProgress.value = `Found ${boxes.length} text regions`

    if (boxes.length === 0) {
      cardsStore.updateFields(id, {}, {})
      return
    }

    // CRNN recognition for each text box
    const textLines: string[] = []
    for (const box of boxes) {
      const cropped = cropImageData(imageData, box.x, box.y, box.width, box.height)
      const crnnInput = preprocessForCRNN(cropped)
      const crnnOutput = await recognizeText(crnnInput)

      const timeSteps = crnnInput.width / 4 // CRNN downsamples width by 4
      const numClasses = 97 // Adjust based on actual model charset
      const { text } = ctcGreedyDecodeWithConfidence(crnnOutput, Math.floor(timeSteps), numClasses)

      if (text.trim().length > 0) {
        textLines.push(text.trim())
      }
    }

    currentProgress.value = 'Classifying fields...'

    // NLP classification
    const { fields, confidence } = classifyToFields(textLines)
    cardsStore.updateFields(id, fields, confidence)
  }

  function cropImageData(imageData: ImageData, x: number, y: number, w: number, h: number): ImageData {
    // Scale box from model input (640x640) back to original image coordinates
    const scaleX = imageData.width / 640
    const scaleY = imageData.height / 640
    const cx = Math.max(0, Math.round(x * scaleX))
    const cy = Math.max(0, Math.round(y * scaleY))
    const cw = Math.min(imageData.width - cx, Math.round(w * scaleX))
    const ch = Math.min(imageData.height - cy, Math.round(h * scaleY))

    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d')!

    // Draw source on temp canvas first
    const srcCanvas = document.createElement('canvas')
    srcCanvas.width = imageData.width
    srcCanvas.height = imageData.height
    srcCanvas.getContext('2d')!.putImageData(imageData, 0, 0)

    ctx.drawImage(srcCanvas, cx, cy, cw, ch, 0, 0, cw, ch)
    return ctx.getImageData(0, 0, cw, ch)
  }

  async function retryCard(id: string, file: File) {
    cardsStore.updateStatus(id, 'processing')
    try {
      await processCard(id, file)
    } catch {
      cardsStore.updateStatus(id, 'error')
    }
  }

  return {
    scanning: readonly(scanning),
    modelLoaded: readonly(loaded),
    modelProgress: readonly(loadProgress),
    modelError: readonly(loadError),
    currentProgress: readonly(currentProgress),
    ensureModelsReady,
    scanFiles,
    retryCard,
  }
}
