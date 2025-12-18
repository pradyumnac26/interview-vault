import { clerkMiddleware, createRouteMatcher } from '@clerk/nuxt/server'
import { defineEventHandler } from 'h3'

// Match routes that should NOT require Clerk
const isPublicRoute = createRouteMatcher([
  '/',
  '/resources/**',
  '/__nuxt_content/**',
  '/_nuxt/**',
  '/favicon.ico',
  '/robots.txt'
])

export default defineEventHandler((event) => {
  // 🚨 Skip Clerk for Nuxt internal + public routes
  if (isPublicRoute(event)) {
    return
  }

  // Apply Clerk auth to everything else
  return clerkMiddleware()(event)
})
