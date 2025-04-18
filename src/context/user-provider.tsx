'use client'

import { Session } from 'next-auth'
import { createContext, ReactNode } from 'react'

type UserContextType = {
  user: Session['user'] | null
}

export const UserContext = createContext<UserContextType>({
  user: null,
})

type UserProviderProps = {
  children: ReactNode
  user: Session['user'] | null
}

export function UserProvider({ children, user }: UserProviderProps) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  )
}
