'use client'

import { Session, User } from 'next-auth'
import { ReactNode, useReducer } from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

import { UserContext } from './context'
import { userReducer } from './reducer'

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
