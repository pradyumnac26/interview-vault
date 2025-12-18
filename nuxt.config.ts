export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@clerk/nuxt'
  ],

  // 1. Map keys explicitly for Vercel
  runtimeConfig: {
    public: {
      clerkPublishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    clerkSecretKey: process.env.NUXT_CLERK_SECRET_KEY,
  },

  // 2. Ensure SSR is ON for @nuxt/content collections to work
  ssr: true,

  // 3. Fix Clerk module resolution & Build errors
  build: {
    transpile: ['@clerk/nuxt']
  },

  nitro: {
    // This tells Nitro NOT to try and bundle Clerk during prerendering
    // which fixes the "Cannot find module ... clerkClient" error
    externals: {
      external: ['@clerk/nuxt']
    },
    prerender: {
      crawlLinks: true, 
      routes: ['/'], 
      failOnError: false 
    }
  },

  content: {
    preview: {
      api: 'https://api.nuxt.com' 
    }
  },

  routeRules: {
    // Static content
    '/resources/**': { prerender: true },
    
    // Sanity Data (ISR keeps it fast but dynamic)
    '/questionbank/**': { isr: true },
    
    // Auth: Force Client-side to avoid Hydration/Blank page issues
    '/login': { ssr: false },
    '/signup': { ssr: false },
    
    // Accessibility: Default everything else to standard SSR
    '/**': { ssr: true }
  },

  css: [
    'highlight.js/styles/atom-one-dark.css',
    '~/assets/css/main.css'
  ],

  devtools: { enabled: true },
  compatibilityDate: '2024-07-11',

  ogImage: {
    enabled: process.env.VERCEL === '1'
  }
})