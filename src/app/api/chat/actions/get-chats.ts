'use server'

import { Chat } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

import { getUserSession } from '../../user/profile/actions/get-user-session'

type Message = {
  id: string
  createdAt: Date
  userId: string | null
  content: string
  role: string
  chatId: string
}

export type ChatWithMessages = Chat & { messages: Message[] }

export async function getChats(): Promise<ChatWithMessages[]> {
  const { session } = await getUserSession()

  if (!session) {
    return []
  }

  const chats = await prisma.chat.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!chats) {
    return []
  }

  return chats
}
