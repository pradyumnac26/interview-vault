// server/middleware/clerk.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nuxt/server'
import { defineEventHandler } from 'h3'

// List routes that should be accessible without a login
const isPublicRoute = createRouteMatcher([
  '/',
  '/resources/:path(.*)',
  '/__nuxt_content/:path(.*)',
  '/_nuxt/:path(.*)',
  '/favicon.ico',
  '/robots.txt'
])

export default defineEventHandler((event) => {
  // 1. EMERGENCY EXIT: If we are building/prerendering, 
  // Clerk must NOT run.
  if (import.meta.prerender || event.context.nitro?.prerender) {
    return
  }

  // 2. Skip authentication for the public routes defined above
  if (isPublicRoute(event)) {
    return
  }

  // 3. Only run Clerk for real-time requests from actual users
  return clerkMiddleware()(event)
})