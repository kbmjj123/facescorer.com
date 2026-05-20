export interface PreprocessedImage {
  data: Float32Array
  width: number
  height: number
}

// Load image from File and return ImageData via Canvas
export async function fileToImageData(file: File): Promise<{ data: ImageData; orientation: number }> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!

  // Handle EXIF orientation via image-orientation CSS property
  ctx.drawImage(bitmap, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  return { data: imageData, orientation: 1 }
}

// Resize and normalize for DB model input: 640x640, float32, CHW, [0,1]
export function preprocessForDB(imageData: ImageData): PreprocessedImage {
  const targetSize = 640
  const canvas = document.createElement('canvas')
  canvas.width = targetSize
  canvas.height = targetSize
  const ctx = canvas.getContext('2d')!

  // Maintain aspect ratio, pad to 640x640
  const scale = targetSize / Math.max(imageData.width, imageData.height)
  const w = Math.round(imageData.width * scale)
  const h = Math.round(imageData.height * scale)
  const dx = Math.floor((targetSize - w) / 2)
  const dy = Math.floor((targetSize - h) / 2)

  // Put source image onto temp canvas first
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = imageData.width
  srcCanvas.height = imageData.height
  srcCanvas.getContext('2d')!.putImageData(imageData, 0, 0)

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, targetSize, targetSize)
  ctx.drawImage(srcCanvas, dx, dy, w, h)

  const resized = ctx.getImageData(0, 0, targetSize, targetSize)

  // Convert to CHW format, float32, normalized [0,1]
  const pixels = resized.data
  const chw = new Float32Array(3 * targetSize * targetSize)
  const area = targetSize * targetSize
  for (let i = 0; i < area; i++) {
    chw[i] = pixels[i * 4]! / 255.0           // R
    chw[area + i] = pixels[i * 4 + 1]! / 255.0 // G
    chw[2 * area + i] = pixels[i * 4 + 2]! / 255.0 // B
  }

  return { data: chw, width: targetSize, height: targetSize }
}

// Normalize sub-image for CRNN input: 32xW, float32, CHW, normalized
export function preprocessForCRNN(imageData: ImageData): PreprocessedImage {
  const targetH = 32
  const scale = targetH / imageData.height
  const targetW = Math.max(Math.round(imageData.width * scale), 8)

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    canvasFromImageData(imageData),
    0, 0, targetW, targetH,
  )

  const resized = ctx.getImageData(0, 0, targetW, targetH)

  // Convert to CHW, float32, normalized [0,1]
  const pixels = resized.data
  const chw = new Float32Array(3 * targetW * targetH)
  const area = targetW * targetH
  for (let i = 0; i < area; i++) {
    chw[i] = pixels[i * 4]! / 255.0
    chw[area + i] = pixels[i * 4 + 1]! / 255.0
    chw[2 * area + i] = pixels[i * 4 + 2]! / 255.0
  }

  return { data: chw, width: targetW, height: targetH }
}

// Helper: convert ImageData to canvas element
function canvasFromImageData(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  canvas.getContext('2d')!.putImageData(imageData, 0, 0)
  return canvas
}
