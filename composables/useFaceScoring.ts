import type { FaceLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision'

export interface FaceScore {
  rawScore: number
  topPercent: number
  label: string
  labelSubtitle: string
  dimensions: Array<{
    name: string
    rank: number
    description: string
    barValue: number
  }>
}

// ── Landmark index helpers ──
const LM = {
  noseTip: 1,
  forehead: 10,
  chin: 152,
  leftEyeOuter: 33,
  leftEyeInner: 133,
  rightEyeInner: 362,
  rightEyeOuter: 263,
  leftCheekbone: 116,
  rightCheekbone: 345,
  leftNoseWing: 358,
  rightNoseWing: 129,
  leftMouthCorner: 61,
  rightMouthCorner: 291,
  browCenter: 8,
  // Symmetry pairs (left → right approximate)
  jawLeft: 172,
  jawRight: 397,
}

function getLM(landmarks: NormalizedLandmark[], idx: number): NormalizedLandmark | undefined {
  return landmarks[idx]
}

function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

// ── Scoring dimensions ──

/** 1. Bilateral Symmetry (20%) */
function scoreSymmetry(landmarks: NormalizedLandmark[]): number {
  // Reflect all points across the vertical midline (x = noseTip.x)
  const cx = getLM(landmarks, LM.noseTip)?.x ?? 0.5
  let sumSq = 0
  let count = 0
  // For each pair of symmetric landmark indices, compare
  // Using all 478: reflect every point and find closest
  // Simplified: sample key pairs
  const pairs = [
    [LM.leftEyeOuter, LM.rightEyeOuter],
    [LM.leftEyeInner, LM.rightEyeInner],
    [LM.leftCheekbone, LM.rightCheekbone],
    [LM.leftNoseWing, LM.rightNoseWing],
    [LM.leftMouthCorner, LM.rightMouthCorner],
    [LM.jawLeft, LM.jawRight],
  ]

  for (const [li, ri] of pairs) {
    const lp = getLM(landmarks, li)
    const rp = getLM(landmarks, ri)
    if (!lp || !rp) continue
    // Reflect right point across midline
    const reflectedX = cx - (rp.x - cx)
    const d = Math.abs(lp.x - reflectedX) + Math.abs(lp.y - rp.y)
    // Normalize: perfect symmetry → d=0, worst → ~0.3
    const score = clamp(1 - d / 0.15, 0, 1)
    sumSq += score
    count++
  }
  if (count === 0) return 50
  return (sumSq / count) * 100
}

/** 2. Golden Ratio (20%) */
function scoreGoldenRatio(landmarks: NormalizedLandmark[]): number {
  const fh = getLM(landmarks, LM.forehead)
  const ch = getLM(landmarks, LM.chin)
  const lb = getLM(landmarks, LM.leftCheekbone)
  const rb = getLM(landmarks, LM.rightCheekbone)
  if (!fh || !ch || !lb || !rb) return 50

  const faceH = dist(fh, ch)
  const faceW = dist(lb, rb)

  const ratio = faceH / Math.max(faceW, 0.001)
  const ideal = 1.618
  const deviation = Math.abs(ratio - ideal) / ideal
  // deviation 0 → score 100, deviation 0.3 → score 0
  return clamp(100 - (deviation / 0.3) * 100, 0, 100)
}

/** 3. Facial Thirds (15%) */
function scoreThirds(landmarks: NormalizedLandmark[]): number {
  const fh = getLM(landmarks, LM.forehead)
  const ch = getLM(landmarks, LM.chin)
  const brow = getLM(landmarks, LM.browCenter)
  const nose = getLM(landmarks, LM.noseTip)
  if (!fh || !ch || !brow || !nose) return 50

  const totalH = dist(fh, ch)
  const upper = dist(fh, brow)   // hairline → brow
  const middle = dist(brow, nose) // brow → nose bottom
  const lower = dist(nose, ch)   // nose → chin

  const ideal = totalH / 3
  const deviations = [
    Math.abs(upper - ideal),
    Math.abs(middle - ideal),
    Math.abs(lower - ideal),
  ]
  const avgDev = (deviations[0]! + deviations[1]! + deviations[2]!) / 3
  const normDev = avgDev / Math.max(totalH, 0.001)
  return clamp(100 - normDev * 300, 0, 100)
}

/** 4. Five-Eye Alignment (15%) */
function scoreFiveEye(landmarks: NormalizedLandmark[]): number {
  const leo = getLM(landmarks, LM.leftEyeOuter)
  const lei = getLM(landmarks, LM.leftEyeInner)
  const rei = getLM(landmarks, LM.rightEyeInner)
  const reo = getLM(landmarks, LM.rightEyeOuter)
  const lb = getLM(landmarks, LM.leftCheekbone)
  const rb = getLM(landmarks, LM.rightCheekbone)
  if (!leo || !lei || !rei || !reo || !lb || !rb) return 50

  const faceW = dist(lb, rb)
  const leftEyeW = dist(leo, lei)
  const rightEyeW = dist(rei, reo)
  const avgEyeW = (leftEyeW + rightEyeW) / 2

  // Ideal: eye width = face width / 5
  const ideal = faceW / 5
  const dev = Math.abs(avgEyeW - ideal) / Math.max(ideal, 0.001)
  return clamp(100 - dev * 100, 0, 100)
}

/** 5. Eye Spacing (10%) */
function scoreEyeSpacing(landmarks: NormalizedLandmark[]): number {
  const lei = getLM(landmarks, LM.leftEyeInner)
  const rei = getLM(landmarks, LM.rightEyeInner)
  const lb = getLM(landmarks, LM.leftCheekbone)
  const rb = getLM(landmarks, LM.rightCheekbone)
  if (!lei || !rei || !lb || !rb) return 50

  const interocular = dist(lei, rei)
  const faceW = dist(lb, rb)
  const ratio = interocular / Math.max(faceW, 0.001)
  const ideal = 0.46
  const dev = Math.abs(ratio - ideal) / ideal
  return clamp(100 - dev * 100, 0, 100)
}

/** 6. Nose-Lip Ratio (10%) */
function scoreNoseLip(landmarks: NormalizedLandmark[]): number {
  const lnw = getLM(landmarks, LM.leftNoseWing)
  const rnw = getLM(landmarks, LM.rightNoseWing)
  const lmc = getLM(landmarks, LM.leftMouthCorner)
  const rmc = getLM(landmarks, LM.rightMouthCorner)
  if (!lnw || !rnw || !lmc || !rmc) return 50

  const noseW = dist(lnw, rnw)
  const mouthW = dist(lmc, rmc)
  const ratio = mouthW / Math.max(noseW, 0.001)
  const ideal = 1.618
  const dev = Math.abs(ratio - ideal) / ideal
  return clamp(100 - dev * 80, 0, 100)
}

/** 7. Jaw Contour (10%) — curvature smoothness */
function scoreJaw(landmarks: NormalizedLandmark[]): number {
  // Sample jaw points along the chin arc
  const jawIndices = [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 397]
  const points = jawIndices.map(i => getLM(landmarks, i)).filter(Boolean) as NormalizedLandmark[]
  if (points.length < 4) return 50

  // Compute curvature variance: for each consecutive triple, compute angle
  const angles: number[] = []
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    const c = points[i + 1]!
    // Vector BA and BC
    const bax = a.x - b.x, bay = a.y - b.y
    const bcx = c.x - b.x, bcy = c.y - b.y
    const dot = bax * bcx + bay * bcy
    const mag = Math.sqrt(bax * bax + bay * bay) * Math.sqrt(bcx * bcx + bcy * bcy)
    const cosA = clamp(dot / Math.max(mag, 0.0001), -1, 1)
    const angle = Math.acos(cosA)
    angles.push(angle)
  }

  if (angles.length < 2) return 50

  const mean = angles.reduce((s, a) => s + a, 0) / angles.length
  const variance = angles.reduce((s, a) => s + (a - mean) ** 2, 0) / angles.length
  // Lower variance = smoother curve → higher score
  return clamp(100 - variance * 200, 0, 100)
}

// ── Weight config ──
const WEIGHTS = [0.20, 0.20, 0.15, 0.15, 0.10, 0.10, 0.10] as const
const DIM_NAMES = [
  'Bilateral Symmetry',
  'Golden Ratio',
  'Facial Thirds',
  'Five-Eye Alignment',
  'Eye Spacing',
  'Nose-Lip Ratio',
  'Jaw Contour',
] as const

const DIM_FUNCS = [
  scoreSymmetry,
  scoreGoldenRatio,
  scoreThirds,
  scoreFiveEye,
  scoreEyeSpacing,
  scoreNoseLip,
  scoreJaw,
] as const

// ── Score → topPercent mapping ──
// Final weighted score is rawSum (0-100) → mapped to 60-99
// topPercent: score 99 → 1%, score 60 → 49% (linear)
function scoreToPercentile(mappedScore: number): number {
  return Math.round(51 - (mappedScore - 60) * (48 / 39))
}

// ── Label generation ──
const LABELS: Record<string, Record<string, string>> = {
  '90+': {
    symmetry: 'Exceptional Symmetry',
    golden: 'Near-Ideal Proportions',
    general: 'Outstanding Geometry',
  },
  '80-89': {
    symmetry: 'Harmonious Symmetry',
    golden: 'Balanced Architecture',
    general: 'Classic Proportions',
  },
  '70-79': {
    symmetry: 'Balanced Features',
    golden: 'Natural Proportions',
    general: 'Natural Balance',
  },
  '60-69': {
    symmetry: 'Distinctive Character',
    golden: 'Unique Geometry',
    general: 'Unique Character',
  },
}

function generateLabel(mappedScore: number, topDim: number): string {
  const tier =
    mappedScore >= 90 ? '90+' :
    mappedScore >= 80 ? '80-89' :
    mappedScore >= 70 ? '70-79' :
    '60-69'

  const tierLabels = LABELS[tier] ?? LABELS['70-79']!

  if (topDim === 0) return tierLabels.symmetry ?? tierLabels.general!
  if (topDim === 1) return tierLabels.golden ?? tierLabels.general!
  return tierLabels.general!
}

// ── Description generation ──
const DESCRIPTIONS: Record<number, (rank: number) => string> = {
  0: (r) => `Your facial symmetry falls in the top ${r}%. Near-perfect balance gives your features a naturally pleasing arrangement.`,
  1: (r) => `Your face proportions are within the top ${r}% for golden ratio alignment. Your facial height-to-width ratio approaches the classical ideal.`,
  2: (r) => `Your facial thirds distribution ranks in the top ${r}%. Balanced vertical proportions are associated with facial harmony across cultures.`,
  3: (r) => `Your eye-to-face width ratio places in the top ${r}%. The five-eye rule describes how eye width relates harmoniously to overall face width.`,
  4: (r) => `Your eye spacing ratio is in the top ${r}%. Proper interocular distance creates a relaxed, approachable eye expression.`,
  5: (r) => `Your nose-to-lip proportion is in the top ${r}%. The relationship between these central features anchors the face's visual balance.`,
  6: (r) => `Your jaw contour smoothness ranks in the top ${r}%. Jaw definition varies widely — this trait is heavily influenced by cultural beauty standards.`,
}

// ── Main scoring function ──
export function useFaceScoring() {
  function compute(result: FaceLandmarkerResult): FaceScore {
    const lm = result.faceLandmarks[0]
    if (!lm) throw new Error('No face landmarks detected')

    const landmarks = lm as NormalizedLandmark[]

    // Compute all 7 dimensions
    const rawDims = DIM_FUNCS.map(fn => clamp(fn(landmarks), 0, 100))

    // Weighted sum
    let weightedSum = 0
    for (let i = 0; i < 7; i++) {
      weightedSum += rawDims[i]! * WEIGHTS[i]!
    }

    // Map to 60-99 range
    const mappedScore = Math.round(60 + (weightedSum / 100) * 39)

    // topPercent
    const topPercent = scoreToPercentile(mappedScore)

    // Find top 2 + 1 interesting dimension
    const sorted = rawDims
      .map((v, i) => ({ v, i }))
      .sort((a, b) => b.v - a.v)

    const top2 = [sorted[0]!, sorted[1]!]
    // "Interesting" dimension: pick from remaining, prefer jaw (6) for diversity
    const interesting = sorted.slice(2).find(d => d.i === 6) ?? sorted[2]!
    const topDims = [top2[0], top2[1], interesting].sort((a, b) => a.i - b.i)

    const dimensions = topDims.map(d => {
      const idx = d.i
      const rank = scoreToPercentile(rawDims[idx]!)
      return {
        name: DIM_NAMES[idx]!,
        rank: clamp(rank, 1, 50),
        description: (DESCRIPTIONS[idx] ?? DESCRIPTIONS[0]!)(clamp(rank, 1, 50)),
        barValue: Math.round(rawDims[idx]!),
      }
    })

    const label = generateLabel(mappedScore, sorted[0]!.i)

    return {
      rawScore: mappedScore,
      topPercent: clamp(topPercent, 1, 49),
      label,
      labelSubtitle: `Your facial structure falls in the top ${topPercent}% for bilateral symmetry.`,
      dimensions,
    }
  }

  return { compute }
}
