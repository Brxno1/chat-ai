import { User } from 'next-auth'

const SET_USER = 'SET_USER' as const
const UPDATE_USER = 'UPDATE_USER' as const

type UserState = {
  user: User
}

type UserAction =
  | { type: typeof SET_USER; payload: User }
  | {
      type: typeof UPDATE_USER
      payload: (prev: User) => User
    }

export const userReducer = (
  state: UserState,
  action: UserAction,
): UserState => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload }
    case UPDATE_USER:
      return { ...state, user: action.payload(state.user) }
    default:
      return state
  }
}
