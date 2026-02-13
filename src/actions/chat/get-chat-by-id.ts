'use server'

import type { UIMessage } from 'ai'

import { extractTextFromParts } from '@/app/api/chat/utils/message-parts'
import { Chat } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'
import { ChatMessage, MessagePart } from '@/types/chat'

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
      let parts: MessagePart[] = []

      try {
        const parsedParts = JSON.parse(message.parts as string)
        parts = parsedParts.map((part: MessagePart) => ({
          ...part,
          details: [],
        }))
      } catch (error) {
        parts = []
      }

      if (message.attachments && message.attachments.length > 0) {
        const fileParts = message.attachments.map((att) => ({
          type: 'file' as const,
          mediaType: att.contentType,
          filename: att.name,
          url: att.url,
        }))
        parts = [...fileParts, ...parts]
      }

      const textContent = extractTextFromParts(parts)
      if (parts.length === 0 || !parts.some((p) => p.type === 'text')) {
        parts.unshift({ type: 'text', text: textContent || '' })
      }

      return {
        id: message.id,
        createdAt: message.createdAt,
        userId: message.userId || userId,
        role: String(message.role).toLowerCase() as UIMessage['role'],
        chatId: message.chatId,
        parts,
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
