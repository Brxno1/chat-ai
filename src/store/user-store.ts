import { Session } from 'next-auth'
import { create } from 'zustand'

type State = {
  user: Session['user'] | null
  email: string
  locale: string
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

type Action = {
  syncUser: (user: Session['user'] | null) => void
  syncEmail: (email: string) => void
  syncStatus: (status: State['status']) => void
  syncLocale: (locale: string) => void
}

type UseSessionStore = State & Action

export const useSessionStore = create<UseSessionStore>((set) => ({
  user: null,
  email: '',
  status: 'unauthenticated',
  locale: '',

  syncUser: (user) => set({ user }),
  syncEmail: (email) => set({ email }),
  syncStatus: (status) => set({ status }),
  syncLocale: (locale) => set({ locale }),
}))
