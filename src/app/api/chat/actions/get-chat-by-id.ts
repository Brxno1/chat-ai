'use server'

import { Message as UIMessage } from '@ai-sdk/react'

import { Chat } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'
import { ChatMessage } from '@/types/chat'

import { extractTextFromParts } from '../utils/message-parts'

type GetChatByIdResponse = {
  chat?: Chat & { messages: (UIMessage & Partial<ChatMessage>)[] }
  error?: string
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
      error: 'Chat not found',
    }
  }

  const messagesWithParts: (ChatMessage & UIMessage)[] = chat.messages.map(
    (message) => {
      const reconstructedParts = JSON.parse(message.parts as string)

      return {
        id: message.id,
        createdAt: message.createdAt,
        userId: message.userId || userId,
        content: extractTextFromParts(reconstructedParts),
        role: String(message.role).toLowerCase() as UIMessage['role'],
        chatId: message.chatId,
        parts: reconstructedParts,
      } as UIMessage & ChatMessage
    },
  )

  return {
    chat: {
      ...chat,
      messages: messagesWithParts,
    },
  }
}
