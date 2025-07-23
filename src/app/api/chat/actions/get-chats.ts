'use server'

import { Chat } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'
import { MessagePart } from '@/types/chat'

import { getUserSession } from '../../user/profile/actions/get-user-session'
import { extractTextFromParts } from '../utils/message-parts'

type Message = {
  id: string
  createdAt: Date
  userId: string | null
  content: string
  role: string
  chatId: string
  parts: MessagePart[]
}

export type ChatWithMessages = Chat & { messages: Message[] }

export type GetChatsResponse = {
  chats: ChatWithMessages[]
  error?: string
  unauthorized?: boolean
}

export async function getChatsAction(): Promise<GetChatsResponse> {
  const { session, error } = await getUserSession()

  if (error || !session) {
    return {
      chats: [],
      error: 'Unauthorized',
      unauthorized: true,
    }
  }

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!chats) {
      return {
        chats: [],
        error: 'No chats found',
      }
    }

    const processedChats = chats.map((chat) => ({
      ...chat,
      messages: chat.messages.map((message) => {
        let reconstructedParts = []
        try {
          reconstructedParts = JSON.parse(message.parts as string)
        } catch (error) {
          console.error('Erro ao analisar JSON de partes da mensagem:', error)
          reconstructedParts = []
        }

        return {
          id: message.id,
          createdAt: message.createdAt,
          userId: message.userId,
          content: extractTextFromParts(reconstructedParts),
          role: message.role,
          chatId: message.chatId,
          parts: reconstructedParts,
        }
      }),
    }))

    return {
      chats: processedChats,
    }
  } catch (error) {
    return {
      chats: [],
      error: 'Error fetching chats',
    }
  }
}
