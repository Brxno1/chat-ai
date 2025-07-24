'use server'

import { Message as UIMessage } from '@ai-sdk/react'

import { Chat } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'
import { ChatMessage } from '@/types/chat'

import { extractTextFromParts } from '../utils/message-parts'

type GetChatByIdResponse = {
  chat: (Chat & { messages: (UIMessage & Partial<ChatMessage>)[] }) | null
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
        include: {
          attachments: true,
        },
      },
    },
  })

  if (!chat) {
    return {
      chat: null,
      error: 'Chat not found',
    }
  }

  const messagesWithParts: (ChatMessage & UIMessage)[] = chat.messages.map(
    (message) => {
      let reconstructedParts = []
      try {
        reconstructedParts = JSON.parse(message.parts as string)
      } catch (error) {
        reconstructedParts = []
      }

      return {
        id: message.id,
        createdAt: message.createdAt,
        userId: message.userId || userId,
        content: extractTextFromParts(reconstructedParts),
        role: String(message.role).toLowerCase() as UIMessage['role'],
        chatId: message.chatId,
        parts: reconstructedParts,
        experimental_attachments: message.attachments,
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
