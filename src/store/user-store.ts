import { Session } from 'next-auth'
import { create } from 'zustand'

type State = {
  user: Session['user'] | null
  email: string
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

type Action = {
  syncUser: (user: Session['user'] | null) => void
  syncEmail: (email: string) => void
  syncStatus: (status: State['status']) => void
}

type UseSessionStore = State & Action

export const useSessionStore = create<UseSessionStore>((set) => ({
  user: null,
  email: '',
  status: 'unauthenticated',

  syncUser: (user) => set({ user }),
  syncEmail: (email) => set({ email }),
  syncStatus: (status) => set({ status }),
}))
