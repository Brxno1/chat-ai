import { Session } from 'next-auth'
import { create } from 'zustand'

type State = {
  user: Session['user'] | null
  email: string
  locale: string
}

type Action = {
  syncUser: (user: Session['user'] | null) => void
  syncEmail: (email: string) => void
  syncLocale: (locale: string) => void
}

type UseSessionStore = State & Action

export const useSessionStore = create<UseSessionStore>((set) => ({
  user: null,
  email: '',
  locale: '',

  syncUser: (user) => set({ user }),
  syncEmail: (email) => set({ email }),
  syncLocale: (locale) => set({ locale }),
}))
