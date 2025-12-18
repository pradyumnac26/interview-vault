<script setup lang="ts">
useSeoMeta({
  title: 'Question bank',
  description: 'Browse curated interview questions and get a feel for the platform before signing up.'
})

// Super simple mock data for now
const questions = [
  {
    id: 'q1',
    title: 'Design a URL shortener',
    role: 'Backend / System Design',
    difficulty: 'Intermediate',
    premium: false
  },
  {
    id: 'q2',
    title: 'Implement an LRU cache',
    role: 'Backend / DSA',
    difficulty: 'Intermediate',
    premium: false
  },
  {
    id: 'q3',
    title: 'How would you debug a memory leak in a Java service?',
    role: 'Backend / Debugging',
    difficulty: 'Senior',
    premium: true
  },
  {
    id: 'q4',
    title: 'Behavioral: Tell me about a time you disagreed with a senior engineer.',
    role: 'Behavioral',
    difficulty: 'Any level',
    premium: true
  }
]
</script>

<template>
  <div class="min-h-screen px-4 py-8 sm:px-8">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Header -->
      <header class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight">
          Question bank
        </h1>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
          Get a feel for how questions are structured before you sign up. Some questions are fully
          accessible, while premium ones require a free account to unlock.
        </p>
      </header>

      <!-- Questions list -->
      <div class="grid gap-4 sm:gap-6">
        <UCard
          v-for="q in questions"
          :key="q.id"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h2 class="font-medium text-sm sm:text-base">
                {{ q.title }}
              </h2>

              <UBadge
                v-if="q.premium"
                color="warning"
                variant="subtle"
                size="xs"
              >
                Premium
              </UBadge>

              <UBadge
                v-else
                color="success"
                variant="subtle"
                size="xs"
              >
                Free preview
              </UBadge>
            </div>

            <p class="text-xs text-gray-500">
              {{ q.role }} · {{ q.difficulty }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <!-- Free questions: always viewable -->
            <template v-if="!q.premium">
              <UButton
                color="neutral"
                size="xs"
                variant="outline"
              >
                View question (coming soon)
              </UButton>
            </template>

            <!-- Premium questions: gated -->
            <template v-else>
              <SignedOut>
                <UButton
                  to="/signup"
                  color="neutral"
                  size="xs"
                  trailing-icon="i-lucide-lock"
                >
                  Sign up to unlock
                </UButton>
              </SignedOut>

              <SignedIn>
                <UButton
                  color="neutral"
                  size="xs"
                  trailing-icon="i-lucide-arrow-right"
                >
                  View full question
                </UButton>
              </SignedIn>
            </template>
          </div>
        </UCard>
      </div>

      <div class="text-xs text-gray-500">
        This is just a preview list. You’ll later plug in your real curated question bank here.
      </div>
    </div>
  </div>
</template>
