'use client'

import { Session } from 'next-auth'
import * as React from 'react'

import { useSessionUserStore } from './user-store'

type UserSetterProps = {
  user: Session['user'] | null
}

export const UserStoreProvider = ({ user }: UserSetterProps) => {
  const setUser = useSessionUserStore((state) => state.setUser)

  React.useEffect(() => {
    setUser(user)
  }, [user])

  return null
}
