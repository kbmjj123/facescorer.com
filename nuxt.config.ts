// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  experimental: {
    viteEnvironmentApi: true,
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
    customRoutes: 'meta',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'cardscan_locale',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  runtimeConfig: {
    public: {
      lsOneTime: process.env.NUXT_PUBLIC_LS_ONE_TIME || '',
      lsMonthly: process.env.NUXT_PUBLIC_LS_MONTHLY || '',
      lsYearly: process.env.NUXT_PUBLIC_LS_YEARLY || '',
    },
  },

  app: {
    head: {
      title: 'CardScan — Scan Business Cards in Bulk',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Upload multiple business cards. AI extracts contacts locally in your browser. Export to Excel, CSV, vCard. Free, no signup, 100% private.' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  build: {
    transpile: ['xlsx'],
  },

  compatibilityDate: '2025-05-13',
})
