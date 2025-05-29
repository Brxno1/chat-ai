'use server'

import { Session } from 'next-auth'

import { auth } from '@/services/auth'

type GetUserSessionResponse = {
  session: Session | null
  error?: string
}

export async function getUserSession(): Promise<GetUserSessionResponse> {
  try {
    const session = await auth()

    if (!session) {
      return {
        session: null,
        error: 'User not authenticated',
      }
    }

    return {
      session,
    }
  } catch (error) {
    return {
      session: null,
      error: 'Error getting user session',
    }
  }
}
