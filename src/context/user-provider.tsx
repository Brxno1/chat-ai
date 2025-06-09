'use client'

import { Session, User } from 'next-auth'
import { createContext, ReactNode, useContext, useState } from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

type UserContextType = {
  session: Session | null
  user: User | undefined
  chats?: ChatWithMessages[]
  refreshChats?: () => Promise<ChatWithMessages[]>
  setUserData: React.Dispatch<React.SetStateAction<User | undefined>>
}

export const UserContext = createContext<UserContextType>({
  session: null,
  user: undefined,
  chats: [],
  refreshChats: async () => [],
  setUserData: () => {},
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
  const [userData, setUserData] = useState<User | undefined>(user)

  return (
    <UserContext.Provider
      value={{ session, user: userData, chats, refreshChats, setUserData }}
    >
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
