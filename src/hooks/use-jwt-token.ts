'use client'

import { useSession } from 'next-auth/react'

export function useJwtToken() {
  const { data: session } = useSession()

  return {
    token: session?.accessToken || null,
    isLoading: !session,
    isAuthenticated: !!session?.accessToken,
  }
}
