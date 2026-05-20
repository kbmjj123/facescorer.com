# Mobile Rules

## Breakpoints (Tailwind)
- Base (mobile): 375px — design here FIRST
- `sm:` 640px
- `md:` 768px — tablet, two-column layouts start here
- `lg:` 1024px — desktop
- `xl:` 1280px — wide desktop

## Mobile-Specific Requirements
- Upload zone: `<input capture="environment">` for camera, large tap target (min 48x48px)
- Results list: single column on mobile, two columns on `md:`
- Export bar: fixed to bottom on mobile (`fixed bottom-0 left-0 right-0`), must respect safe-area-inset-bottom
- No hover-only interactions — everything tappable
- Font size minimum 16px for inputs (prevents iOS zoom on focus)

## Testing Checklist
- [ ] iPhone SE (375px) — smallest supported width
- [ ] iPhone 14 (390px)
- [ ] iPad (768px)
- [ ] Landscape mode on phone
- [ ] Pinch-to-zoom doesn't break layout (`meta viewport` must be set)
- [ ] Camera upload works on iOS Safari

## iOS Safari Gotchas
- `position: fixed` elements shift when keyboard opens — use `env(safe-area-inset-bottom)`
- HEIC files from camera — must convert via `heic2any`
- IndexedDB works but has storage limits — show warning if model cache fails
- `<input type="file" multiple>` works, but file picker shows camera option automatically with `accept="image/*"`
