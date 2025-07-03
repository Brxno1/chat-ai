/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import { Chat, Message } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

import { MessagePart, reconstructMessageParts } from '../utils/message-parts'

type GetChatByIdResponse = {
  chat?: Chat & { messages: (Message & { parts?: any })[] }
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
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!chat) {
    return {
      chat: undefined,
      success: false,
      error: 'Chat not found',
    }
  }

  // Reconstruir as parts das mensagens
  const messagesWithParts = chat.messages.map((message) => {
    let reconstructedParts: MessagePart[] | null = null

    // Se a mensagem tem parts salvas, reconstruí-las
    if (message.parts) {
      try {
        const savedParts =
          typeof message.parts === 'string'
            ? JSON.parse(message.parts)
            : message.parts
        reconstructedParts = reconstructMessageParts(savedParts)
      } catch (error) {
        console.error('Erro ao reconstruir parts da mensagem:', error)
      }
    }

    return {
      ...message,
      userId: message.userId || userId,
      role: message.role.toLowerCase() as 'USER' | 'ASSISTANT',
      parts: reconstructedParts,
    }
  })

  return {
    chat: {
      ...chat,
      messages: messagesWithParts,
    },
    success: true,
  }
}
