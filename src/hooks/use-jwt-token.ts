'use client'

import { useSession } from '@/services/auth/auth-client'

export function useJwtToken() {
  const session = useSession()

  return {
    token: session.data?.session?.token || null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.session?.token,
  }
}
