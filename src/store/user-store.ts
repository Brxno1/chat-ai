import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { create } from 'zustand'

type State = {
  session: ReturnType<typeof useSession> | null
  user: User | null
  email: string
  locale: string
}

type Action = {
  syncSession: (session: ReturnType<typeof useSession>) => void
  syncUser: (user: User) => void
  syncEmail: (email: string) => void
  syncLocale: (locale: string) => void
}

type UseSessionStore = State & Action

export const useSessionStore = create<UseSessionStore>((set) => ({
  session: null,
  user: null,
  email: '',
  locale: '',

  syncSession: (session) => set({ session }),
  syncUser: (user) => set({ user }),
  syncEmail: (email) => set({ email }),
  syncLocale: (locale) => set({ locale }),
}))
