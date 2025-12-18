import { clerkMiddleware, createRouteMatcher } from '@clerk/nuxt/server'
import { defineEventHandler } from 'h3'

// ✅ path-to-regexp compatible patterns ONLY
const isPublicRoute = createRouteMatcher([
  '/',
  '/resources/:path(.*)',
  '/__nuxt_content/:path(.*)',
  '/_nuxt/:path(.*)',
  '/favicon.ico',
  '/robots.txt'
])

export default defineEventHandler((event) => {
  // Skip Clerk for public & internal routes
  if (isPublicRoute(event)) {
    return
  }

  // Apply Clerk auth everywhere else
  return clerkMiddleware()(event)
})
