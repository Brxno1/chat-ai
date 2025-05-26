'use client'

import { Session } from 'next-auth'
import * as React from 'react'

import { useSessionStore } from './user-store'

type SyncSessionProps = {
  initialSession: Session
}

export function SyncSession({ initialSession }: SyncSessionProps) {
  const { syncSession, syncLocale, syncUser } = useSessionStore()

  React.useEffect(() => {
    if (initialSession?.user) {
      syncSession(initialSession)
      syncUser(initialSession.user)
      syncLocale(
        typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
      )
    }
  }, [initialSession])

  return null
}
