'use client'

import { Session, User } from 'next-auth'
import { ReactNode, useReducer } from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'
import { initializeChatStore } from '@/store/chat'

import { UserContext } from './context'
import { userReducer } from './reducer'

type UserChatProviderProps = {
  session: Session | null
  user: User | undefined
  chats?: ChatWithMessages[]
  children: ReactNode
}

export function UserChatProvider({
  children,
  session,
  user,
  chats,
}: UserChatProviderProps) {
  if (!user) {
    throw new Error('User is required')
  }

  const [state, dispatch] = useReducer(userReducer, { user })

  const chatStore = initializeChatStore({ initialChats: chats })

  const setUser = (user: User | ((prev: User) => User)) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: user as (prev: User) => User,
    })
  }

  return (
    <UserContext.Provider
      value={{
        session,
        chats: chatStore.getState().chats,
        user: state.user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
