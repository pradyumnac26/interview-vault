<script setup lang="ts">
import { fetchTracks } from '../../../lib/sanityClient'

// --- TYPE DEFINITIONS ---
interface Track {
    _id: string;
    slug: string;
    title: string;
    description: string;
    badge: string;
    date: string;
}

// --- DATA FETCHING ---
// Use the typed useAsyncData
const { data: tracks } = await useAsyncData<Track[]>('tracks', () => fetchTracks())

// --- STYLING CONSTANTS ---
const glowClasses = [
  'text-indigo-500 ring-indigo-500/50 hover:shadow-[0_0_40px_rgba(129,140,248,0.8)] dark:hover:shadow-[0_0_40px_rgba(129,140,248,0.9)]',
  'text-emerald-500 ring-emerald-500/50 hover:shadow-[0_0_40px_rgba(52,211,153,0.8)] dark:hover:shadow-[0_0_40px_rgba(52,211,153,0.9)]',
  'text-amber-500 ring-amber-500/50 hover:shadow-[0_0_40px_rgba(251,191,36,0.8)] dark:hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]',
  'text-red-500 ring-red-500/50 hover:shadow-[0_0_40px_rgba(248,113,113,0.8)] dark:hover:shadow-[0_0_40px_rgba(248,113,113,0.9)]'
] as const

// Fix: Use non-null assertion (!) to guarantee return type is string
const getGlowClass = (index: number): string => glowClasses[index % glowClasses.length]!


// --- ICON MAPPING ---
// Fix: Explicitly define return type as string
const getIconForTrack = (trackTitle: string, index: number): string => {
  const iconMap: { [key: string]: string } = {
    'frontend': 'i-heroicons-code-bracket-square',
    'backend': 'i-heroicons-server-stack',
    'devops': 'i-heroicons-cloud',
    'database': 'i-heroicons-server',
    'system design': 'i-heroicons-squares-2x2',
    'full-stack': 'i-heroicons-rocket-launch'
  }
  const lowerTitle = trackTitle.toLowerCase()
  for (const keyword in iconMap) {
    // If a keyword matches, return the icon
    if (lowerTitle.includes(keyword)) {
      return iconMap[keyword]! // Use ! in case iconMap somehow returns undefined
    }
  }
  // Fallback to default icons based on index
  const defaultIcons = [
    'i-heroicons-light-bulb',
    'i-heroicons-pencil-square',
    'i-heroicons-academic-cap',
    'i-heroicons-globe-alt'
  ]
  // Use non-null assertion for the final guaranteed return
  return defaultIcons[index % defaultIcons.length]!
}

// --- SEO METADATA ---
const title = 'Question Bank'
const description = 'Browse curated question sets organized by role, skill, and company.'
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <UContainer>
    <UPageHeader
      :title="title"
      :description="description"
      class="py-[50px]"
    />

    <UPageBody>
      <div v-if="tracks" class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        
        <NuxtLink
          v-for="(track, index) in tracks"
          :key="track._id"
          :to="`/questionbank/${track.slug}`"
          class="block group"
        >
          <UCard
            class="h-full transform transition-transform duration-300 ease-out border-none"
            :class="[
              // Base ring color
              'ring-gray-200 dark:ring-gray-800',
              // Hover effects
              'hover:-translate-y-2',
              'hover:ring-2 hover:ring-primary-500 dark:hover:ring-primary-400',
              // Custom glow
              getGlowClass(index)
            ]"
            :ui="{
              // Use the class string directly for the body
              body: 'px-4 py-5 sm:p-6'
            }"
          >
            <div class="flex flex-col h-full">
              <div class="mb-4 flex items-start space-x-4">
                <div 
                  class="p-3 rounded-xl flex-shrink-0" 
                  :class="[
                    'bg-gray-100 dark:bg-gray-800',
                    'ring-2',
                    // Sets icon background ring color
                    getGlowClass(index).split(' ')[0] 
                  ]"
                >
                  <UIcon 
                    :name="getIconForTrack(track.title, index)" 
                    class="w-6 h-6" 
                    :class="getGlowClass(index).split(' ')[0]"
                  />
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-semibold line-clamp-2 text-gray-900 dark:text-white">
                    {{ track.title }}
                  </h3>
                  <UBadge
                    v-if="track.badge"
                    :label="track.badge"
                    class="mt-1"
                    variant="subtle"
                  />
                </div>
              </div>

              <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 flex-grow">
                {{ track.description }}
              </p>

              <div v-if="track.date" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
                Created: {{ new Date(track.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <div v-else class="flex justify-center items-center py-20">
        <UProgress indicator class="w-20" />
      </div>

    </UPageBody>
  </UContainer>
</template>