import { createAuthClient } from 'better-auth/client'
import { magicLinkClient } from 'better-auth/client/plugins'

import { env } from '@/lib/env'

export const { signIn, signUp, useSession } = createAuthClient({
  plugins: [magicLinkClient()],
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
})
