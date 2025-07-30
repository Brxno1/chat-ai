'use client'

import { Session, User } from 'next-auth'
import { createContext, ReactNode, useContext } from 'react'
import { StoreApi, useStore } from 'zustand'

import { createUserStore, UserState } from './index'

type UserProviderProps = {
  session: Session | null
  user: User | undefined
  children: ReactNode
}

const UserStoreContext = createContext<StoreApi<UserState> | null>(null)

export function UserStoreProvider({
  children,
  session,
  user,
}: UserProviderProps) {
  const store = createUserStore({
    initialSession: session,
    initialUser: user,
  })

  return (
    <UserStoreContext.Provider value={store}>
      {children}
    </UserStoreContext.Provider>
  )
}

export const useUserStore = <T,>(selector: (state: UserState) => T): T => {
  const store = useContext(UserStoreContext)
  if (!store) {
    throw new Error('useUserStore must be used within a UserStoreProvider')
  }

  return useStore(store, selector)
}
