export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@clerk/nuxt'
  ],

  runtimeConfig: {
    public: {
      clerkPublishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    clerkSecretKey: process.env.NUXT_CLERK_SECRET_KEY,
  },

  nitro: {
    prerender: {
      crawlLinks: true,    // This will find your .md files automatically
      failOnError: false,  // If a page has an error during build, keep going
    }
  },

  routeRules: {
    // 1. Resources: Prerender these so they don't 404 on refresh
    '/resources/**': { prerender: true, ssr: true },

    // 2. Auth: Match your actual URLs (/login and /signup)
    // We set ssr: false here so Clerk doesn't cause "blank page" hydration errors
    '/login/**': { ssr: false },
    '/signup/**': { ssr: false },

    // 3. Accessibility: Ensure the rest of the site is standard SSR
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