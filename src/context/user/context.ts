import { Session, User } from 'next-auth'
import { createContext, useContext } from 'react'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

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

export const useSessionUser = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useSessionUser must be used within a UserChatProvider')
  }

  return context
}
