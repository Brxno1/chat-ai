'use server'

import { Message as UIMessage } from '@ai-sdk/react'

import { Chat } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'
import { ChatMessage } from '@/types/chat'

import { extractTextFromParts } from '../utils/message-filter'
import { MessagePart, reconstructMessageParts } from '../utils/message-parts'

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

  const messagesWithParts: (UIMessage & ChatMessage)[] = chat.messages.map(
    (message) => {
      let reconstructedParts: MessagePart[] | null = null

      try {
        reconstructedParts = reconstructMessageParts(
          JSON.parse(message.parts as string),
        )
      } catch (error) {
        console.error('Error reconstructing message parts:', error)
      }

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
