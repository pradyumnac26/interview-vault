// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@clerk/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: [
    'highlight.js/styles/atom-one-dark.css',
    '~/assets/css/main.css'
  ],

  /**
   * Route rules
   * - Do NOT prerender auth pages
   * - Redirect resources index
   */
  routeRules: {
    '/': { prerender: false }, // 👈 CRITICAL: prevent Clerk crash
    '/resources': {
      redirect: '/resources/getting-started',
      prerender: false
    }
  },

  compatibilityDate: '2024-07-11',

  /**
   * Nitro prerender config
   * - Disable crawling to avoid accidental auth routes
   * - No forced routes
   */
  nitro: {
    prerender: {
      crawlLinks: false
    }
  }
})
