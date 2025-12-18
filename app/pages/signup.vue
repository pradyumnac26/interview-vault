<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useRouter } from '#app'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const toast = useToast()
const router = useRouter()

// 👇 your fields exactly as before
const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Name',
  placeholder: 'Enter your name'
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email'
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}]

// Validation schema (same shape)
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

// ⬇️ Clerk composable (auto-imported by @clerk/nuxt)
const { isLoaded, signUp, setActive } = useSignUp()

// Social sign-up (Google / GitHub) via Clerk
async function handleOAuth (provider: 'oauth_google' | 'oauth_github') {
  if (!isLoaded.value || !signUp.value) {
    toast.add({
      title: 'Please wait',
      description: 'Auth is still loading, try again in a moment.'
    })
    return
  }

  try {
    await signUp.value.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/resources'
    })
  } catch (err: any) {
    toast.add({
      title: 'Sign up with provider failed',
      description: err?.errors?.[0]?.message || 'Could not start social sign up.'
    })
    console.error('OAuth sign-up error', err)
  }
}

// Providers for UAuthForm (same shape, but now real)
const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => handleOAuth('oauth_google')
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => handleOAuth('oauth_github')
}]

// Form submit → Clerk email/password sign-up
async function onSubmit (payload: FormSubmitEvent<Schema>) {
  const { data } = payload

  if (!isLoaded.value || !signUp.value || !setActive.value) {
    toast.add({
      title: 'Please wait',
      description: 'Auth is still loading, try again in a moment.'
    })
    return
  }

  try {
    // create user in Clerk using your name/email/password fields
    const result = await signUp.value.create({
      emailAddress: data.email,
      password: data.password,
      firstName: data.name
    })

    if (result.status === 'complete' && result.createdSessionId) {
      await setActive.value({ session: result.createdSessionId })

      toast.add({
        title: 'Account created',
        description: 'Welcome! Redirecting you to your question bank.'
      })

      await router.push('/resources')
      return
    }

    // if your Clerk instance requires verification, you’ll handle that here later
    toast.add({
      title: 'Almost there',
      description: 'Please verify your email to finish signing up.'
    })
  } catch (err: any) {
    const message =
      err?.errors?.[0]?.message ||
      err?.message ||
      'Something went wrong while creating your account.'

    toast.add({
      title: 'Sign up failed',
      description: message
    })
    console.error('Clerk sign-up error', err)
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Create an account"
    :submit="{ label: 'Create account' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account?
      <ULink
        to="/login"
        class="text-primary font-medium"
      >
        Login
      </ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our
      <ULink
        to="/"
        class="text-primary font-medium"
      >
        Terms of Service
      </ULink>.
    </template>
  </UAuthForm>
</template>
