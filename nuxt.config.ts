// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  experimental: {
    viteEnvironmentApi: true,
  },

  vite: {
    server: {
      fs: {
        strict: true,
      },
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'zh', language: 'zh-CN', file: 'zh.json', name: '中文' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'fs_locale',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  app: {
    head: {
      title: 'FaceScorer — AI Face Analysis, 100% Private',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Get your AI face analysis score in seconds. 100% in-browser — your photo never leaves your device. Free face analyzer based on golden ratio & symmetry.' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap' },
      ],
    },
  },

  compatibilityDate: '2025-05-13',
})
