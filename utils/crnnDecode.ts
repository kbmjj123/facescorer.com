// CTC greedy decoder for CRNN model output
// CRNN output shape: [1, T, num_classes] where T = sequence length

// Simplified charset covering English alphabet, digits, and common Chinese characters
// In production, this should match the model's actual charset
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ '

export function ctcGreedyDecode(
  output: Float32Array,
  timeSteps: number,
  numClasses: number,
  blankIdx = numClasses - 1,
): string {
  const chars: string[] = []
  let prevIdx = blankIdx

  for (let t = 0; t < timeSteps; t++) {
    // Find max probability class at this timestep
    let maxProb = -Infinity
    let maxIdx = blankIdx
    const offset = t * numClasses
    for (let c = 0; c < numClasses; c++) {
      const prob = output[offset + c]!
      if (prob > maxProb) {
        maxProb = prob
        maxIdx = c
      }
    }

    // Collapse repeated chars, skip blank
    if (maxIdx !== blankIdx && maxIdx !== prevIdx) {
      const char = ALPHABET[maxIdx]
      if (char) chars.push(char)
    }
    prevIdx = maxIdx
  }

  return chars.join('')
}

// Decode with confidence scores per character
export function ctcGreedyDecodeWithConfidence(
  output: Float32Array,
  timeSteps: number,
  numClasses: number,
  blankIdx = numClasses - 1,
): { text: string; confidence: number } {
  const chars: string[] = []
  const confidences: number[] = []
  let prevIdx = blankIdx

  for (let t = 0; t < timeSteps; t++) {
    let maxProb = -Infinity
    let maxIdx = blankIdx
    const offset = t * numClasses
    for (let c = 0; c < numClasses; c++) {
      const prob = output[offset + c]!
      if (prob > maxProb) {
        maxProb = prob
        maxIdx = c
      }
    }

    if (maxIdx !== blankIdx && maxIdx !== prevIdx) {
      const char = ALPHABET[maxIdx]
      if (char) {
        chars.push(char)
        confidences.push(maxProb)
      }
    }
    prevIdx = maxIdx
  }

  const avgConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0

  return { text: chars.join(''), confidence: avgConfidence }
}
