# FaceScorer · CLAUDE.md

## 🚀 Session Start

You have Superpowers and UI-UX-Pro-Max skills installed.

**RIGHT NOW, before doing anything else:**
1. Run `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "face analysis beauty tool" --design-system` to load design context
2. Read `@.claude/skills/ui-ux-pro-max/SKILL.md` for UI standards
3. Read `@.claude/plugins/Superpowers/skills/getting-started/SKILL.md` for workflow
4. Read `@.claude/design-system/MASTER.md` — **the single source of truth for all visual decisions**

**Workflow for every task: Brainstorm → Plan → Execute. Never skip to Execute.**

---

## ⚡ Session Ground Rules

- **Package manager:** `pnpm` — all install/build/dev commands use pnpm, never npm
- **Versions:** use latest stable versions of all dependencies (Nuxt, Vue, i18n, etc.)
- **Dependencies already installed** — never run `pnpm install` or check node_modules status
- **Don't run dev server to verify** — just tell the user to check the effect themselves; don't block on `nuxt dev` or `nuxt generate` unless specifically asked
- **TypeScript only** — all code in TypeScript, no `.js` files

---

## 📦 Product

**Product:** AI face analysis platform — upload a selfie, AI analyzes facial geometry locally in the browser, generates shareable result cards.

**Two tools:**
- **Face Analyzer** (`/`) — 7-dimension facial geometry scoring (symmetry, golden ratio, facial thirds, etc.)
- **Age Detector** (`/age`) — AI age estimation (±4.5 years accuracy)

**Key principle:** 100% client-side, zero backend, no photo uploads. All inference in the browser.

---

## 🏗 Tech Stack

```
Models:     MediaPipe Face Landmarker (WASM + WebGL2, 478 landmarks, 52 blendshapes)
            + Lightweight ONNX age estimation model (~3MB, /age page only)

Rendering:  Canvas API — landmark overlay, symmetry lines, golden ratio grid, share cards

Framework:  Nuxt 4 + Vue 3 + Tailwind CSS (SSG, ssr: false)

Hosting:    Cloudflare Pages (global CDN, free tier)

Models CDN: Cloudflare R2 (on-demand, browser-cached)

Monetize:   Google AdSense (banner ads in FAQ + below results)

i18n:       en (default) + zh + ja (P1)

State:      Pinia

License:    Apache 2.0 (open source)
```

---

## 📂 Project Structure

```
facescorer.com/
├── CLAUDE.md
├── .claude/
│   ├── PRD.md                  # Full product requirements doc
│   └── design-system/
│       ├── MASTER.md           # ← Design system source of truth
│       ├── pages/
│       │   ├── index.md        # Face Analyzer page overrides (TBD)
│       │   └── age.md          # Age Detector page overrides (TBD)
│       └── share-card-styles.md # 5 share card styles (TBD)
├── nuxt.config.ts
├── tailwind.config.ts
├── public/
│   ├── models/                 # ONNX age model (~3MB)
│   ├── wasm/                   # MediaPipe + ONNX Runtime WASM files
│   ├── _headers                # Cloudflare: COOP/COEP headers
│   └── robots.txt
├── components/
│   ├── FaceUploadZone.vue      # Upload / camera capture
│   ├── FaceCanvas.vue          # Canvas overlay — landmarks + measurement lines
│   ├── FaceResult.vue          # Score + top 3 dimensions + labels
│   ├── ShareCard.vue           # Share card preview + download / copy / share
│   ├── AgeResult.vue           # Age estimation result display
│   ├── CrossPromo.vue          # Cross-link between Face Analyzer ↔ Age Detector
│   ├── FAQ.vue                 # SEO FAQ section
│   └── PhotoQualityGuard.vue   # Pre-analysis checks (face detected, lighting, etc.)
├── composables/
│   ├── useFaceLandmarker.ts    # MediaPipe model load + face detection
│   ├── useAgeModel.ts          # ONNX age model load + inference
│   ├── useFaceScoring.ts       # 7-dimension score calculation from landmarks
│   ├── useShareCard.ts         # Canvas share card synthesis
│   └── usePhotoBus.ts          # Photo memory passing between / and /age
├── stores/
│   └── faceResult.ts           # Current analysis state
├── utils/
│   ├── scoring.ts              # Geometry math (symmetry, golden ratio, thirds, etc.)
│   ├── shareCardRenderer.ts    # 5-style card template renderers
│   └── landmarks.ts            # Landmark index helpers (478-point MediaPipe topology)
├── i18n/
│   └── locales/
│       ├── en.json
│       ├── zh.json
│       └── ja.json
└── pages/
    ├── index.vue               # Face Analyzer (home page = product)
    └── age.vue                 # Age Detector
```

---

## ⚙️ Critical Config

**`nuxt.config.ts` must include:**
```ts
nitro: { preset: 'cloudflare-pages' }
ssr: false  // client-side only
```

**`public/_headers` must include:**
```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
/models/*
  Cache-Control: public, max-age=31536000, immutable
/*.wasm
  Content-Type: application/wasm
  Cache-Control: public, max-age=31536000, immutable
```

**MediaPipe WASM files** must be copied to `public/wasm/` via postinstall:
```json
"postinstall": "cp -r node_modules/@mediapipe/tasks-vision/wasm/* public/wasm/ 2>/dev/null; cp node_modules/onnxruntime-web/dist/*.wasm public/wasm/ 2>/dev/null || true"
```

**i18n config:**
```ts
i18n: {
  locales: [
    { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
    { code: 'zh', language: 'zh-CN', file: 'zh.json', name: '中文' },
    { code: 'ja', language: 'ja-JP', file: 'ja.json', name: '日本語' },
  ],
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'fs_locale',
    redirectOn: 'root',
    fallbackLocale: 'en',
  },
}
```

---

## 📐 Coding Standards

- **TypeScript** everywhere — no `any`, use proper interfaces
- **i18n** — never hardcode UI strings; always use `$t('key')` in templates, `useI18n().t('key')` in `<script setup>`; keys live in all 3 locale files
- **Composables** for all logic — components are thin, dumb presentational shells
- **No API calls** — this is a zero-backend app; all inference runs locally
- **Mobile-first** Tailwind — design at 375px, add `md:` / `lg:` breakpoints
- **Async/await** with try/catch — never unhandled promise rejections
- **Canvas operations** must respect device pixel ratio (`window.devicePixelRatio`)

---

## 🎨 UI Rules

**Design system reference (read before every UI task):**

@.claude/design-system/MASTER.md

Run design search before every UI task:
```
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<context>" --design-system
```

**Component workflow — never build a full page at once:**

| Order | Component | Key concern |
|-------|-----------|-------------|
| 1 | Hero Section | First impression, copy credibility |
| 2 | FaceUploadZone | Touch target ≥ 44px, no dashed border |
| 3 | FaceCanvas (analysis animation) | Keypoint stagger, line draw timing |
| 4 | Score Display | tabular-nums, "Top X%" framing |
| 5 | Dimension Cards | stagger entrance, numeric backing per claim |
| 6 | ShareCard | Canvas 2D only, 1080×1920, best feature only |

**Desktop layout:** left = photo + Canvas overlay · right = score data (two-column)
**Mobile layout:** single column, photo full-width at top, results below

### 5 Non-Negotiable Style Constraints

**① Font**
- Headings: `font-heading` (Instrument Sans), `letter-spacing: -0.02em`
- Score / data numbers: `font-body` + `font-variant-numeric: tabular-nums`, weight 600–700
- Body: `font-body` (Inter), 400–500
- Never use: Roboto, Open Sans, Lato, or any font not in MASTER.md §3

**② Color**
- Page background: `#FAF9F6` — never pure `#FFFFFF`
- Primary accent: `#0D7B78` (teal) — never blue or purple as primary
- Warm accent `#C8824A`: score numbers and overlay lines only — not buttons or nav
- Shadows: `box-shadow: 0 1px 2px rgba(0,0,0,0.04)` (card) or `0 4px 12px rgba(0,0,0,0.06)` (elevated) only
- Forbidden: blue-purple gradients, neon glow, `backdrop-filter` blur cards

**③ Spacing**
- Base unit: 4px grid
- Within a component group: `gap-2` (8px) to `gap-3` (12px)
- Between sections: `gap-12` (48px) to `gap-16` (64px) on mobile
- **Intentional unevenness creates hierarchy** — never normalize all gaps to the same value

**④ Shadow**
- Only use the two shadow tokens above
- To separate layers: use background color contrast, not heavy blur shadows
- Never: `box-shadow: 0 20px 60px rgba(0,0,0,0.1)` or any large-spread shadow

**⑤ Interaction**
- Hover: subtle background-color shift, `transition: 150ms`
- Active / press: `scale(0.97)` or `scale(0.98)`, `100ms`
- All transitions: color `150ms` · transform `200ms` · size `300ms`
- No instant state changes — every visual change needs `transition ≥ 150ms`
- Touch targets: minimum `44×44px` — no exceptions

---

## 🔍 Face Analysis Rules

### 7 Scoring Dimensions
| # | Dimension | Weight | Key landmarks |
|---|-----------|--------|---------------|
| 1 | Bilateral Symmetry | 20% | Left-right mirror pairs, RMSE |
| 2 | Golden Ratio | 20% | Face height/width vs 1.618 |
| 3 | Facial Thirds | 15% | Hairline-brow, brow-nose, nose-chin equality |
| 4 | Five-Eye Alignment | 15% | Eye width vs face width (1/5 ideal) |
| 5 | Eye Spacing | 10% | Interocular / face width vs 0.46 |
| 6 | Nose-Lip Ratio | 10% | Mouth width / nose width vs 1.618 |
| 7 | Jaw Contour | 10% | Jaw angle landmark arc smoothness |

### Scoring Rules
- Each dimension scored 0–100 independently
- Weighted sum mapped to **60–99** range (floor at 60)
- Display as "Top X%" not raw score (framing effect)
- Only show top 2 dimensions + 1 "interesting" dimension (3 total, not all 7)
- Every claim must be backed by a number: "eye spacing ratio 0.44, within ideal range 0.42–0.46"

### Label System (social currency)
Generated from top dimension + score tier:
- 90+: "Exceptional Symmetry", "Near-Ideal Proportions"
- 80-89: "Harmonious Symmetry", "Balanced Architecture"
- 70-79: "Classic Proportions", "Natural Balance"
- 60-69: "Distinctive Character", "Unique Geometry"

### Photo Quality Checks (before analysis)
- No face detected → prompt "Use a clear front-facing photo"
- Multiple faces → highlight largest, note "Analyzing the closest face"
- Low resolution → warn "Higher resolution = more accurate results"
- Profile/angled (>45°) → suggest front-facing photo
- HEIC conversion via `heic2any` for iPhone photos

---

## 🃏 Share Card Rules

### Card Specs
- **Size**: 1080×1920px (9:16 portrait)
- **Technology**: Canvas 2D manual composition (NOT html2canvas — cross-origin issues)
- **Trigger**: auto-generate preview after analysis completes, no user click needed

### Card Content
- User photo (large, dominant)
- Top dimension label + score (NOT a list of all dimensions)
- Subtle facescorer.com branding
- Share cards show only the user's BEST feature, not weaknesses

### 5 Auto-Matched Styles
| Language | Perceived Gender | Style |
|----------|-----------------|-------|
| en | Female | Editorial fashion: cream + black + gold |
| en | Male | Tech/data: dark bg + neon gradient |
| zh | Female | Xiaohongshu: cream white + coral pink + gold |
| zh | Male | Data-tech: deep blue cold tone |
| ja | Any | Minimal: near-white gray + black/white mono |

Fallback: unknown language → en/female style. Gender confidence < 0.6 → that language's female style.

### Card Actions
- Download as PNG
- Copy to clipboard (`navigator.clipboard.write()` with ClipboardItem)
- Web Share API (mobile, `navigator.share()`)

---

## 👤 Age Detector Rules

- ONNX age model (~3MB) loaded only on `/age` page
- Face Landmarker model shared with Face Analyzer (cached in memory)
- Display estimated age prominently
- Ask for real age → show delta (underestimated / overestimated)
- If AI overestimates: "This is often related to lighting or photo angle — try again in natural light"
- Always give user an external attribution for negative results
- Cross-promo: "See your full face analysis →" at bottom

---

## 📸 Photo Bus (Cross-Page Memory)

```ts
// usePhotoBus.ts — pass photo between / and /age without re-upload
const photoBus = ref<{ file: File; imageData: ImageData } | null>(null)
// Both pages check photoBus on mount — if populated, skip upload step
// Uses a shared Pinia store or a simple module-level reactive ref
```

---

## 💰 Ad Placement Rules

| Position | Format | When |
|----------|--------|------|
| FAQ section | Native content ad | Bottom of page, after results |
| Below share card | Banner | After emotional peak |
| Age result page | Banner | Below age result |

**Absolutely never**: ads during analysis animation, ads during share card generation.

---

## 🧪 Before Marking Any Task Done

- [ ] Works on mobile (Safari iOS + Chrome Android) at 375px width
- [ ] No console errors
- [ ] TypeScript compiles (`nuxt typecheck`)
- [ ] All new UI strings added to en.json + zh.json (+ ja.json if applicable)
- [ ] Language switcher works, locale persists after page refresh
- [ ] Landmark animation plays smoothly on mobile (test on mid-range device)
- [ ] Share card downloads as valid PNG at 1080×1920
- [ ] MediaPipe initializes without COOP/COEP errors
- [ ] Photo quality guard handles: no-face, multi-face, low-res, profile
- [ ] Disclaimer appears on result page: "Based on geometric proportions, for reference only"
- [ ] Privacy badge visible in Hero + Upload + FAQ sections
- [ ] No forbidden visual patterns (see MASTER.md §9 + UI Rules §5 above)
- [ ] All spacing uses hierarchy (unequal gaps intentional, never normalized)
- [ ] All interactions have transition ≥ 150ms and visual feedback

---

## 🚫 Never Do

- Never add a backend / API route / server middleware
- Never upload/store/transmit user photos to any server
- Never use `npm` — always `pnpm`
- Never hardcode UI text strings — always `$t()` / `useI18n().t()`
- Never add a key to one locale file without adding to the other two
- Never block the UI thread during model inference — always async
- Never show raw scores without "Top X%" framing
- Never show all 7 dimensions — only top 2 + 1 interesting
- Never make claims without a number backing them
- Never insert ads during analysis animation or share card generation
- Never skip the Brainstorm → Plan phase for tasks > 30 min
- Never run dev server or build to verify — just tell the user to check
- Never use pure `#FFFFFF` as page background — use `#FAF9F6`
- Never use blue or purple as primary accent color
- Never use `box-shadow` larger than the `elevated` token
- Never equalize all spacing — hierarchy requires intentional unevenness
- Never omit `transition` on interactive elements
