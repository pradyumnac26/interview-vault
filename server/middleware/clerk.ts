import { clerkMiddleware } from '@clerk/nuxt/server'
import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  // 🚨 CRITICAL: Never run Clerk during Nitro prerender / build
  if (process.env.NITRO_PRERENDER === 'true') {
    return
  }

  // Run Clerk ONLY at runtime for real user requests
  return clerkMiddleware()(event)
})
