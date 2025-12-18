<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const items = computed(() => [{
  label: 'Resources',
  to: '/resources',
  active: route.path.startsWith('/resources')
}, {
  label: 'Question Bank',
  to: '/questionbank'
}, {
  label: 'Pricing',
  to: '/pricing'
}, {
  label: 'Changelog',
  to: '/changelog'
}])

// Clerk auth state (auto-imported from @clerk/nuxt)
const { isLoaded, signOut } = useAuth()

const handleSignOut = async () => {
  if (!isLoaded.value || !signOut.value) return

  await signOut.value()
  await router.push('/') // after sign out, send them home
}
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <!-- 🔻 When signed OUT: show Sign in / Sign up -->
      <SignedOut>
        <!-- Mobile: icon-only sign in -->
        <UButton
          icon="i-lucide-log-in"
          color="neutral"
          variant="ghost"
          to="/login"
          class="lg:hidden"
        />

        <!-- Desktop: Sign in + Sign up -->
        <UButton
          label="Sign in"
          color="neutral"
          variant="outline"
          to="/login"
          class="hidden lg:inline-flex"
        />

        <UButton
          label="Sign up"
          color="neutral"
          trailing-icon="i-lucide-arrow-right"
          class="hidden lg:inline-flex"
          to="/signup"
        />
      </SignedOut>

      <!-- 🔻 When signed IN: show avatar + Sign out -->
      <SignedIn>
        <!-- Clerk user menu -->
        <UserButton
          :appearance="{
            elements: {
              // Popover card + sections
              userButtonPopoverCard: 'bg-slate-950 border border-slate-800 text-slate-100 shadow-xl',
              userButtonPopoverMain: 'bg-slate-950',
              userButtonPopoverFooter: 'bg-slate-950 border-t border-slate-800',

              // User preview text
              userButtonPopoverUserPreviewMainIdentifier: 'text-slate-100',
              userButtonPopoverUserPreviewSecondaryIdentifier: 'text-slate-400',

              // Actions
              userButtonPopoverActionButton: 'hover:bg-slate-900 text-slate-100',
              userButtonPopoverActionButtonIcon: 'text-slate-400',
              userButtonPopoverActionButtonText: 'text-slate-100',

              // Avatar trigger in header
              avatarBox: 'h-8 w-8'
            }
          }"
        />

        <!-- Mobile: icon-only sign out -->
        <UButton
          icon="i-lucide-log-out"
          color="neutral"
          variant="ghost"
          class="lg:hidden"
          @click="handleSignOut"
        />

        <!-- Desktop: Sign out button -->
        <UButton
          label="Sign out"
          color="neutral"
          variant="outline"
          class="hidden lg:inline-flex"
          @click="handleSignOut"
        />
      </SignedIn>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <!-- Mobile menu auth actions -->
      <SignedOut>
        <UButton
          label="Sign in"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton
          label="Sign up"
          color="neutral"
          to="/signup"
          block
        />
      </SignedOut>

      <SignedIn>
        <UButton
          label="Go to questions"
          color="neutral"
          to="/questions"
          block
          class="mb-3"
        />
        <UButton
          label="Sign out"
          color="neutral"
          variant="outline"
          block
          @click="handleSignOut"
        />
      </SignedIn>
    </template>
  </UHeader>
</template>
