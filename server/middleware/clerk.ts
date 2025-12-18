import { clerkMiddleware, createRouteMatcher } from '@clerk/nuxt/server'
import { defineEventHandler } from 'h3'

// Public & internal routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/resources/:path(.*)',
  '/__nuxt_content/:path(.*)',
  '/_nuxt/:path(.*)',
  '/favicon.ico',
  '/robots.txt'
])

export default defineEventHandler((event) => {
  /**
   * 🚨 ABSOLUTE RULE:
   * Never run Clerk during prerender / build
   */
  if (event.context.nitro?.prerender) {
    return
  }

  // Skip Clerk for public routes
  if (isPublicRoute(event)) {
    return
  }

  // Run Clerk ONLY for real runtime requests
  return clerkMiddleware()(event)
})
