'use client'

import { useSession } from 'next-auth/react'
import * as React from 'react'

import { useSessionStore } from './user-store'

export function SyncSession() {
  const session = useSession()

  const { syncSession, syncLocale, syncUser } = useSessionStore()

  React.useEffect(() => {
    if (session.status === 'authenticated' && session) {
      try {
        syncSession(session)
        syncUser(session.data.user)
        syncLocale(
          typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
        )
      } catch (error) {
        console.error('Error synchronizing user data:', error)
      }
    }
  }, [session, syncSession, syncLocale, syncUser])

  return null
}
