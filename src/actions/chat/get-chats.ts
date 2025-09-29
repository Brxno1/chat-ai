'use server'

import { getUserSession } from '@/actions/user/profile/get-user-session'
import { Chat } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'

export type GetChatsResponse = {
  chats: Chat[]
  error?: string
  unauthorized?: boolean
}

export async function getChatsAction(): Promise<GetChatsResponse> {
  const { session, error } = await getUserSession()

  if (error || !session) {
    return {
      chats: [],
      error: 'Unauthorized',
      unauthorized: true,
    }
  }

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!chats) {
      return {
        chats: [],
        error: 'No chats found',
      }
    }

    return {
      chats,
    }
  } catch (error) {
    return {
      chats: [],
      error: 'Error fetching chats',
    }
  }
}
