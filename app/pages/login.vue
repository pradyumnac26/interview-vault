<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useRouter } from '#app'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
})

const toast = useToast()
const router = useRouter()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox' as const
}]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

// Clerk: sign-in flow
const { isLoaded, signIn, setActive } = useSignIn()

// Clerk: auth state (to know if user is already signed in)
const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()

// 🚀 If already signed in, bounce them straight to /questions
watchEffect(async () => {
  if (isAuthLoaded.value && isSignedIn.value) {
    await router.push('/questions')
  }
})

// Social login (Google / GitHub)
async function handleOAuth (provider: 'oauth_google' | 'oauth_github') {
  if (!isLoaded.value || !signIn.value) {
    toast.add({
      title: 'Please wait',
      description: 'Auth is still loading, try again in a moment.'
    })
    return
  }

  try {
    await signIn.value.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/questions'
    })
  } catch (err: any) {
    const firstError = err?.errors?.[0]
    const message = firstError?.message || err?.message || ''

    // If Clerk says "session already exists", just treat it as success
    if (
      firstError?.code === 'session_exists' ||
      (message.toLowerCase().includes('session') &&
       message.toLowerCase().includes('exist'))
    ) {
      toast.add({
        title: 'Already signed in',
        description: 'Redirecting you to your question bank.'
      })
      await router.push('/questions')
      return
    }

    toast.add({
      title: 'Login with provider failed',
      description: message || 'Could not start social login.'
    })
    console.error('OAuth login error', err)
  }
}

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => handleOAuth('oauth_google')
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => handleOAuth('oauth_github')
}]

// Email/password login
async function onSubmit (payload: FormSubmitEvent<Schema>) {
  const { data } = payload

  if (!isLoaded.value || !signIn.value || !setActive.value) {
    toast.add({
      title: 'Please wait',
      description: 'Auth is still loading, try again in a moment.'
    })
    return
  }

  try {
    const result = await signIn.value.create({
      identifier: data.email,
      password: data.password
    })

    if (result.status === 'complete' && result.createdSessionId) {
      await setActive.value({ session: result.createdSessionId })

      toast.add({
        title: 'Logged in',
        description: 'Welcome back!'
      })

      await router.push('/questions')
      return
    }

    toast.add({
      title: 'Additional steps required',
      description: 'Please complete the verification step.'
    })
  } catch (err: any) {
    const message =
      err?.errors?.[0]?.message ||
      err?.message ||
      'Something went wrong while logging you in.'

    toast.add({
      title: 'Login failed',
      description: message
    })
    console.error('Clerk sign-in error', err)
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Welcome back"
    icon="i-lucide-lock"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account?
      <ULink
        to="/signup"
        class="text-primary font-medium"
      >
        Sign up
      </ULink>.
    </template>

    <template #password-hint>
      <ULink
        to="/"
        class="text-primary font-medium"
        tabindex="-1"
      >
        Forgot password?
      </ULink>
    </template>

    <template #footer>
      By signing in, you agree to our
      <ULink
        to="/"
        class="text-primary font-medium"
      >
        Terms of Service
      </ULink>.
    </template>
  </UAuthForm>
</template>
