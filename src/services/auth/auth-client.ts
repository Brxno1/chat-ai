import { createAuthClient } from 'better-auth/react'
import { magicLinkClient } from 'better-auth/client/plugins'

import { env } from '@/lib/env'

export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
