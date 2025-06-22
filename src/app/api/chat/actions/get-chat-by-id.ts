'use server'

import { Chat, Message } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

type GetChatByIdResponse = {
  chat?: Chat & { messages: Message[] }
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
      chat: undefined,
      success: false,
      error: 'Chat not found',
    }
  }

  return {
    chat: {
      ...chat,
      messages: chat.messages.map((message) => ({
        ...message,
        userId: message.userId || userId,
        role: message.role.toLowerCase() as 'USER' | 'ASSISTANT',
      })),
    },
    success: true,
  }
}
