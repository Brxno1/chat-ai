'use server'

import { getSession } from '@/services/auth'
import type { Session } from '@/types/auth'

type GetUserSessionResponse = {
  session: Session | null
  error?: string
}

export async function getUserSession(): Promise<GetUserSessionResponse> {
  try {
    const session = await getSession()

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
    console.error('Error in getUserSession:', error)
    return {
      session: null,
      error: 'Error getting user session',
    }
  }
}
