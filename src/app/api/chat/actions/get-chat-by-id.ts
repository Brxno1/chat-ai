'use server'

import { Chat } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

type Message = {
  id: string
  createdAt: Date
  userId: string | null
  content: string
  role: string
  chatId: string
}

type GetChatByIdResponse = {
  chat: (Chat & { messages: Message[] }) | null
  error?: string
  success: boolean
}

export async function getChatById(
  chatId: string,
  userId: string,
): Promise<GetChatByIdResponse> {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId,
    },
    include: {
      messages: true,
    },
  })

  if (!chat) {
    return {
      chat: null,
      success: false,
      error: 'Chat not found',
    }
  }

  return {
    chat,
    success: true,
  }
}
