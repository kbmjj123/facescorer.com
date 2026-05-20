# UI Component Rules

## Before Writing Any Component
1. Run design search: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<component purpose>" --design-system`
2. Check if a similar component already exists in `components/`
3. Define props interface in TypeScript before writing template

## Component Structure (enforced order)
```vue
<script setup lang="ts">
// 1. imports
// 2. props/emits interface
// 3. composable calls
// 4. computed / refs
// 5. methods
// 6. lifecycle hooks (onMounted last)
</script>

<template>
  <!-- single root element -->
</template>
```

## Required for Every Component
- Mobile layout at 375px minimum width (test this first)
- Loading state: skeleton or spinner while async data loads
- Empty state: what shows when there's no data
- Error state: what shows when something fails
- All interactive elements must have accessible labels (`aria-label` if no visible text)

## Tailwind Conventions
- Mobile-first: write base styles for mobile, add `md:` and `lg:` for larger screens
- Use CSS variables for colors that match the design system
- Avoid arbitrary values `[123px]` — use spacing scale
- Animation: use `transition-all duration-200` for hover states

## UploadZone Specific
- Drag-over state: `border-blue-500 bg-blue-50` ring
- Must support: drag-drop, click-to-browse, mobile camera (`capture="environment"`)
- Show file count and size feedback immediately on selection

## CardResult Specific
- Thumbnail: 60x40px, `object-cover`, rounded corners
- Fields: click-to-edit inline (no modal), `blur` saves to Pinia store
- Confidence colors: `border-green-400` / `border-yellow-400` / `border-red-400`
- Delete button: confirm before removing (inline "Are you sure?" not a modal)
