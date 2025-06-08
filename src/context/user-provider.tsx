'use client'

import { Session, User } from 'next-auth'
import { createContext, ReactNode, useContext } from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

type UserContextType = {
  session: Session | null
  user: User | undefined
  chats?: ChatWithMessages[]
  refreshChats?: () => Promise<ChatWithMessages[]>
}

export const UserContext = createContext<UserContextType>({
  session: null,
  user: undefined,
  chats: [],
  refreshChats: async () => [],
})

type UserChatProviderProps = {
  children: ReactNode
  session: Session | null
  user: User | undefined
  chats?: ChatWithMessages[]
  refreshChats?: () => Promise<ChatWithMessages[]>
}

export function UserChatProvider({
  children,
  session,
  user,
  chats = [],
  refreshChats = async () => [],
}: UserChatProviderProps) {
  return (
    <UserContext.Provider value={{ session, user, chats, refreshChats }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within a UserChatProvider')
  }

  return context
}
