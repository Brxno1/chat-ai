'use server'

import type { UIMessage } from 'ai'

import { extractTextFromParts } from '@/app/api/chat/utils/message-parts'
import { Chat } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'
import type { ChatMessage } from '@/types/chat'

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
      let parts: UIMessage['parts'] = []

      try {
        if (message.parts) {
          const parsedParts = JSON.parse(
            message.parts as string,
          ) as UIMessage['parts']
          parts = parsedParts.map((part) =>
            part.type === 'tool-invocation'
              ? { ...part, details: [] }
              : { ...part },
          ) as UIMessage['parts']
        }
      } catch (error) {
        parts = []
      }

      const hasBase64File = parts.some(
        (p) => p.type === 'file' && p.url?.startsWith('data:'),
      )
      const hasNoFileParts = !parts.some((p) => p.type === 'file')

      if (
        (hasNoFileParts || hasBase64File) &&
        message.attachments &&
        message.attachments.length > 0
      ) {
        parts = parts.filter(
          (p) => !(p.type === 'file' && p.url?.startsWith('data:')),
        )

        const fileParts: UIMessage['parts'] = message.attachments.map(
          (att) => ({
            type: 'file',
            mediaType: att.contentType,
            url: att.url,
          }),
        )
        parts = [...fileParts, ...parts]
      }

      const hasTextParts = parts.some((p) => p.type === 'text')
      const hasToolParts = parts.some(
        (p) => p.type === 'tool-invocation' || p.type.startsWith('tool-'),
      )

      if (parts.length === 0 || (!hasTextParts && !hasToolParts)) {
        const textContent = extractTextFromParts(parts)
        parts.unshift({ type: 'text', text: textContent || '' })
      }

      return {
        id: message.id,
        createdAt: message.createdAt,
        userId: message.userId ?? userId,
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
