// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@clerk/nuxt'
  ],

  // 1. Map keys explicitly so the module doesn't "guess" 
  // and crash when it can't find them during build.
  runtimeConfig: {
    clerkSecretKey: process.env.NUXT_CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY,
    public: {
      clerkPublishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    }
  },

  // 2. The most important part: Kill the crawler.
  // This prevents Nitro from "pretending" to be a user during the build.
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/'], // Only prerender the home page (static)
      ignore: ['/resources/**', '/dashboard/**'] // Force skip auth-heavy areas
    }
  },

  routeRules: {
    '/resources': { redirect: '/resources/getting-started' },
    // Ensure auth pages are always dynamic (SSR), never static
    '/sign-in/**': { prerender: false },
    '/sign-up/**': { prerender: false },
    '/dashboard/**': { prerender: false }
  },

  css: [
    'highlight.js/styles/atom-one-dark.css',
    '~/assets/css/main.css'
  ],

  devtools: { enabled: true },
  compatibilityDate: '2024-07-11',

  ogImage: {
    // Disable during Vercel build to save resources and prevent timeouts
    enabled: process.env.VERCEL !== '1'
  }
})