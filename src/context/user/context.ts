'use client'

import { Session, User } from 'next-auth'
import { createContext, useContext } from 'react'

import { Notification } from '@/types/notifications'

type UserContextType = {
  session: Session | null
  user: User | undefined
  notifications?: Notification[]
  setUser: (
    userOrFn: User | ((prev: User | undefined) => User | undefined),
  ) => void
}

export const UserContext = createContext<UserContextType>({
  session: null,
  user: undefined,
  notifications: [],
  setUser: () => {},
})

export const useSessionUser = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useSessionUser must be used within a UserProvider')
  }

  return context
}
