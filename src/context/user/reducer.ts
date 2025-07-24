import { User } from 'next-auth'

const UPDATE_USER = 'UPDATE_USER' as const

type UserState = {
  user: User | undefined
}

type UserAction = {
  type: typeof UPDATE_USER
  payload: (prev: User | undefined) => User | undefined
}

export const userReducer = (
  state: UserState,
  action: UserAction,
): UserState => {
  switch (action.type) {
    case UPDATE_USER:
      return { ...state, user: action.payload(state.user) }
    default:
      return state
  }
}
