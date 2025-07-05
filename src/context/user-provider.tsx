'use client'

import { Session, User } from 'next-auth'
import { createContext, ReactNode, useContext, useReducer } from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

import { userReducer } from './reducer'

type UserContextType = {
  session: Session | null
  user: User | undefined
  chats?: ChatWithMessages[]
  isCreatingChat: boolean
  setUser: (
    userOrFn: User | undefined | ((prev: User | undefined) => User | undefined),
  ) => void
  setCreatingChat: (isCreating: boolean) => void
}

export const UserContext = createContext<UserContextType>({
  session: null,
  user: undefined,
  chats: [],
  isCreatingChat: false,
  setUser: () => {},
  setCreatingChat: () => {},
})

type UserChatProviderProps = {
  children: ReactNode
  session: Session | null
  user: User | undefined
  chats?: ChatWithMessages[]
}

export function UserChatProvider({
  children,
  session,
  user,
  chats = [],
}: UserChatProviderProps) {
  const [state, dispatch] = useReducer(userReducer, {
    user,
    isCreatingChat: false,
  })

  const setUser = (
    userOrFn: User | undefined | ((prev: User | undefined) => User | undefined),
  ) => {
    if (typeof userOrFn === 'function') {
      dispatch({
        type: 'UPDATE_USER',
        payload: userOrFn as (prev: User | undefined) => User | undefined,
      })
    } else {
      dispatch({ type: 'SET_USER', payload: userOrFn as User | undefined })
    }
  }

  const setCreatingChat = (isCreating: boolean) => {
    dispatch({ type: 'SET_CREATING_CHAT', payload: isCreating })
  }

  return (
    <UserContext.Provider
      value={{
        session,
        chats,
        user: state.user,
        isCreatingChat: state.isCreatingChat,
        setUser,
        setCreatingChat,
      }}
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
