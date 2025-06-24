'use server'

import { prisma } from '@/services/database/prisma'

type DeleteChatByIdResponse = {
  success: boolean
  error?: string
}

export async function deleteChatById(
  chatId: string,
  userId: string,
): Promise<DeleteChatByIdResponse> {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    })

    if (!chat) {
      return {
        success: false,
        error: 'Chat not found',
      }
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete chat',
    }
  }
}
