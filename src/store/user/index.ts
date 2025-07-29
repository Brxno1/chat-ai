import { Session, User } from 'next-auth'
import { create } from 'zustand'

import { ChatWithMessages } from '@/app/api/chat/actions/get-chats'

interface State {
  session: Session | null
  user: User | undefined
  chats: ChatWithMessages[] | []
}

interface Actions {
  setSession: (session: Session | null) => void
  setUser: (
    userOrFn: User | ((prev: User | undefined) => User | undefined),
  ) => void
  setChats: (chats: ChatWithMessages[]) => void
}

type UseUserStoreProps = {
  initialSession?: Session | null
  initialUser?: User
  initialChats?: ChatWithMessages[]
}

const createUserStore = (initialProps?: UseUserStoreProps) =>
  create<State & Actions>()((set) => ({
    session: initialProps?.initialSession || null,
    user: initialProps?.initialUser || undefined,
    chats: initialProps?.initialChats || [],

    setSession: (session) => set({ session }),

    setUser: (userOrFn) =>
      set((state) => ({
        user: typeof userOrFn === 'function' 
          ? userOrFn(state.user) 
          : userOrFn,
      })),

    setChats: (chats) => set({ chats }),
  }))

export const useUserStore = createUserStore()

export function initializeUserStore(props?: UseUserStoreProps) {
  return createUserStore(props)
}