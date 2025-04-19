'use client'

import { useSession } from 'next-auth/react'
import * as React from 'react'

import { useSessionStore } from './user-store'

type UserSetterProps = {
  session: ReturnType<typeof useSession>
}

export const UserStoreProvider = ({ session }: UserSetterProps) => {
  const syncUser = useSessionStore((state) => state.syncUser)

  React.useEffect(() => {
    if (session.status === 'authenticated' && session.data?.user) {
      syncUser(session.data.user)
    }
  }, [session.status, session.data?.user, syncUser])

  return null
}
