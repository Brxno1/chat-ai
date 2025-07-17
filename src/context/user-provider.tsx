'use client'

import { Session, User } from 'next-auth'
import { createContext, ReactNode, useContext, useReducer } from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

import { userReducer } from './reducer'

type UserContextType = {
  session: Session | null
  user: User | undefined
  chats?: ChatWithMessages[]
  setUser: (userOrFn: User | ((prev: User) => User)) => void
}

export const UserContext = createContext<UserContextType>({
  session: null,
  user: undefined,
  chats: [],
  setUser: () => {},
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
    user: user!,
  })

  const setUser = (user: User | ((prev: User) => User)) => {
    if (typeof user === 'function') {
      dispatch({
        type: 'UPDATE_USER',
        payload: user as (prev: User) => User,
      })
    } else {
      dispatch({ type: 'SET_USER', payload: user as User })
    }
  }

  return (
    <UserContext.Provider
      value={{
        session,
        chats,
        user: state.user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useSessionUser = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useSessionUser must be used within a UserChatProvider')
  }

  return context
}
