'use client'

import { Session, User } from 'next-auth'
import { ReactNode, useReducer } from 'react'

import { UserContext } from './context'
import { userReducer } from './reducer'

type UserProviderProps = {
  session: Session | null
  user: User | undefined
  children: ReactNode
}

export function UserProvider({ children, session, user }: UserProviderProps) {
  const [state, dispatch] = useReducer(userReducer, { user })

  const setUser = (
    userOrFn: User | ((prev: User | undefined) => User | undefined),
  ) => {
    dispatch({
      type: 'UPDATE_USER',
      payload:
        typeof userOrFn === 'function'
          ? (userOrFn as (prev: User | undefined) => User | undefined)
          : () => userOrFn,
    })
  }

  return (
    <UserContext.Provider
      value={{
        session,
        user: state.user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
