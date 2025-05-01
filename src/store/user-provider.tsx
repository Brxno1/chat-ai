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
  const syncLocale = useSessionStore((state) => state.syncLocale)

  React.useEffect(() => {
    if (session?.status === 'authenticated' && session.data?.user) {
      try {
        syncUser(session.data.user)
        syncLocale(
          typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
        )
      } catch (error) {
        console.error('Erro ao sincronizar dados do usuário:', error)
      }
    }
  }, [session, syncUser, syncLocale])

  return <>{children}</>
}
