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

  routeRules: {
    '/resources': {
      redirect: '/resources/getting-started'
    }
  },

  compatibilityDate: '2024-07-11',

  /**
   * 🚨 EFFECTIVELY DISABLE PRERENDER (TypeScript-safe)
   */
  nitro: {
    prerender: {
      routes: [],
      crawlLinks: false,
      failOnError: false
    }
  },

  /**
   * Disable OG image generation during Vercel build
   */
  ogImage: {
    enabled: process.env.VERCEL !== '1'
  }
})
