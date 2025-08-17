'use server'

import { cookies } from 'next/headers'
import { Session } from 'next-auth'

import { getJwtToken } from '@/lib/get-jwt-token'
import { auth } from '@/services/auth'

type GetUserSessionResponse = {
  session: Session | null
  token?: string | null
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

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('authjs.session-token')?.value

    if (!sessionToken) {
      return {
        session,
        token: null,
        error: 'JWT token not found in cookies',
      }
    }

    const { bearerToken } = (await getJwtToken()) || { bearerToken: null }

    return {
      session,
      token: bearerToken,
    }
  } catch (error) {
    console.error('Error in getUserSession:', error)
    return {
      session: null,
      token: null,
      error: 'Error getting user session',
    }
  }
}
