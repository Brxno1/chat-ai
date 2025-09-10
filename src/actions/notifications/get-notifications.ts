'use server'

import { cookies } from 'next/headers'

import { getUserSession } from '@/actions/user/profile/get-user-session'
import { api } from '@/lib/axios'
import { getJwtToken } from '@/lib/get-jwt-token'
import { type Notification } from '@/types/notifications'

export type GetNotificationsResponse = {
  notifications: Notification[]
  error?: string
  unauthorized?: boolean
}

export async function getNotificationsAction(): Promise<GetNotificationsResponse> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('authjs.session-token')?.value

  if (!sessionToken) {
    return {
      notifications: [],
      error: 'No session token',
      unauthorized: true,
    }
  }

  const { token } = await getJwtToken(sessionToken)
  const { session, error } = await getUserSession()

  if (error || !session || !token) {
    return {
      notifications: [],
      error: 'Unauthorized',
      unauthorized: true,
    }
  }

  try {
    const { data } = await api.get<{ notifications: Notification[] }>(
      `http://localhost:3333/notifications/${session.user.id}/list?page=1&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return {
      notifications: data.notifications ?? [],
    }
  } catch (err) {
    return {
      notifications: [],
      error: 'Error fetching notifications',
    }
  }
}
