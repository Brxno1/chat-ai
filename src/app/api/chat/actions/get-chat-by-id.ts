'use server'

import { Chat } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

type GetChatByIdResponse = {
  chat: Chat | null
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
