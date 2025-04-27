'use client'

import { useSession } from 'next-auth/react'
import * as React from 'react'

import { useSessionStore } from './user-store'

type UserProviderProps = {
  children: React.ReactNode
}

export const UserStoreProvider = ({ children }: UserProviderProps) => {
  const session = useSession()

  const syncUser = useSessionStore((state) => state.syncUser)
  const syncStatus = useSessionStore((state) => state.syncStatus)
  const syncLocale = useSessionStore((state) => state.syncLocale)

  React.useEffect(() => {
    if (session?.status === 'authenticated' && session.data?.user) {
      try {
        syncUser(session.data.user)
        syncStatus(session.status)
        syncLocale(
          typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
        )
      } catch (error) {
        console.error('Erro ao sincronizar dados do usuário:', error)
      }
    } else if (session?.status === 'unauthenticated') {
      syncStatus('unauthenticated')
    }
  }, [session, syncUser, syncStatus, syncLocale])

  return <>{children}</>
}
