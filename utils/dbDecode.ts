// Decode DB model output (binary segmentation map) to bounding boxes
// DB output shape: [1, 1, H, W] — probability map

export interface TextBox {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

export function decodeDBOutput(
  output: Float32Array,
  inputWidth: number,
  inputHeight: number,
  threshold = 0.3,
): TextBox[] {
  const probMap = output // shape: H x W
  const boxes: TextBox[] = []

  // Find connected components via simple threshold + bounding rects
  const visited = new Uint8Array(inputWidth * inputHeight)
  const minArea = 100 // minimum pixels for a text region

  for (let y = 0; y < inputHeight; y++) {
    for (let x = 0; x < inputWidth; x++) {
      const idx = y * inputWidth + x
      if (visited[idx] || probMap[idx]! < threshold) continue

      // Flood fill to find connected component
      const component = floodFill(probMap, visited, x, y, inputWidth, inputHeight, threshold)
      if (component.pixels.length < minArea) continue

      const bounds = getBoundingBox(component.pixels, inputWidth)
      boxes.push({
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        confidence: component.sum / component.pixels.length,
      })
    }
  }

  // Sort by Y position (top to bottom), then X (left to right)
  boxes.sort((a, b) => {
    const yDiff = a.y - b.y
    if (Math.abs(yDiff) < a.height * 0.5) return a.x - b.x
    return yDiff
  })

  return boxes
}

function floodFill(
  map: Float32Array,
  visited: Uint8Array,
  startX: number,
  startY: number,
  width: number,
  height: number,
  threshold: number,
): { pixels: number[]; sum: number } {
  const stack = [[startX, startY]]
  const pixels: number[] = []
  let sum = 0

  while (stack.length > 0) {
    const point = stack.pop()
    if (!point || point.length < 2) continue
    const x = point[0]!
    const y = point[1]!
    const idx = y * width + x

    if (x < 0 || x >= width || y < 0 || y >= height) continue
    if (visited[idx]) continue
    if (map[idx]! < threshold) continue

    visited[idx] = 1
    pixels.push(idx)
    sum += map[idx]!

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }

  return { pixels, sum }
}

function getBoundingBox(pixels: number[], width: number) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const idx of pixels) {
    const x = idx % width
    const y = Math.floor(idx / width)
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { minX, minY, maxX, maxY }
}
