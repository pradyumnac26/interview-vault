export default defineNuxtConfig({
  // ... existing modules ...

  // 1. Ensure SSR is ON for the collections to be read
  ssr: true,

  content: {
    // This ensures your collections (index, docs) are properly indexed
    preview: {
      api: 'https://api.nuxt.com' 
    }
  },

  nitro: {
    prerender: {
      // This is the critical fix for your 404s
      crawlLinks: true, 
      routes: ['/'], // Force the home page to start the crawl
      failOnError: false 
    }
  },

  routeRules: {
    // Ensure your docs/resources are generated as static files
    '/resources/**': { prerender: true },
    // Ensure Sanity-heavy pages (questionbank) are rendered on demand
    '/questionbank/**': { isr: true },
    // Fix for Clerk routes
    '/login': { ssr: false },
    '/signup': { ssr: false }
  }
})