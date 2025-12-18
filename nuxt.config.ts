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
    '/': { prerender: false },
    '/resources': {
      redirect: '/resources/getting-started',
      prerender: false
    },

    // Never prerender Nuxt Content internals
    '/__nuxt_content/**': { prerender: false }
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      crawlLinks: false,
      ignore: ['/__nuxt_content/**']
    }
  },

  // Disable OG image generation during Vercel build
  ogImage: {
    enabled: process.env.VERCEL !== '1'
  }
})
