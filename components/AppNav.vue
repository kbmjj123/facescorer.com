<script setup lang="ts">
const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
]

const isHome = computed(() => route.path === '/' || route.path === '')
const isAge = computed(() => route.path.startsWith('/age'))
</script>

<template>
  <header class="sticky top-0 z-50 bg-cream border-b border-border" style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
    <nav class="max-w-6xl mx-auto px-5 h-14 md:h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="font-heading font-semibold text-black text-[17px] tracking-[-0.02em]">
        {{ t('nav.logo') }}
      </NuxtLink>

      <!-- Desktop: page links + language switcher -->
      <div class="hidden md:flex items-center gap-5">
        <NuxtLink
          to="/"
          class="text-[14px] font-medium transition-colors duration-150 hover:text-black"
          :class="isHome ? 'text-black' : 'text-muted-fg'"
        >
          {{ t('nav.face_analyzer') }}
        </NuxtLink>
        <NuxtLink
          to="/age"
          class="text-[14px] font-medium transition-colors duration-150 hover:text-black"
          :class="isAge ? 'text-black' : 'text-muted-fg'"
        >
          {{ t('nav.age_detector') }}
        </NuxtLink>

        <!-- Divider -->
        <span class="w-px h-4 bg-border" />

        <!-- Language switcher -->
        <span class="flex items-center gap-2 text-[12px] text-muted-fg">
          <template v-for="(l, i) in locales" :key="l.code">
            <span v-if="i > 0" class="text-border select-none">·</span>
            <NuxtLink
              :to="switchLocalePath(l.code)"
              class="transition-colors duration-150 hover:text-black"
              :class="locale === l.code ? 'text-black font-semibold' : ''"
            >
              {{ l.label }}
            </NuxtLink>
          </template>
        </span>
      </div>

      <!-- Mobile: language switcher only -->
      <span class="flex md:hidden items-center gap-1.5 text-[12px] text-muted-fg">
        <template v-for="(l, i) in locales" :key="l.code">
          <span v-if="i > 0" class="text-border select-none">·</span>
          <NuxtLink
            :to="switchLocalePath(l.code)"
            class="transition-colors duration-150 hover:text-black"
            :class="locale === l.code ? 'text-black font-semibold' : ''"
          >
            {{ l.label }}
          </NuxtLink>
        </template>
      </span>
    </nav>
  </header>
</template>
