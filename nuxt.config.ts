// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
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
    'highlight.js/styles/atom-one-dark.css', // 1) base theme
    '~/assets/css/main.css'                  // 2) your overrides (wins)
  ],

  routeRules: {
    '/resources': { redirect: '/resources/getting-started', prerender: false }
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
