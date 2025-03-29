import { create } from 'zustand'

type State = {
  user: {
    email: string
    count: number
  }
}

type Action = {
  setEmail: (email: string) => void

  increment: () => void
  decrement: () => void
  reset: () => void
}

type UseEmailStore = State & Action

const useEmailStore = create<UseEmailStore>((set) => ({
  user: {
    email: '',
    count: 0,
  },

  setEmail: (email) => {
    set((state) => ({ user: { ...state.user, email } }))
  },

  increment: () => {
    set((state) => ({ user: { ...state.user, count: state.user.count + 1 } }))
  },

  decrement: () => {
    set((state) => ({ user: { ...state.user, count: state.user.count - 1 } }))
  },

  reset: () => {
    set((state) => ({ user: { ...state.user, count: 0 } }))
  },
}))

export { useEmailStore }
