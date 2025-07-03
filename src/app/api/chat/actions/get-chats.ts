/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import { Chat } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

import { getUserSession } from '../../user/profile/actions/get-user-session'
import { MessagePart, reconstructMessageParts } from '../utils/message-parts'

type Message = {
  id: string
  createdAt: Date
  userId: string | null
  content: string
  role: string
  chatId: string
  parts?: any
}

export type ChatWithMessages = Chat & { messages: Message[] }

export async function getChats(): Promise<ChatWithMessages[]> {
  const { session } = await getUserSession()

  if (!session) {
    return []
  }

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
    return []
  }

  return chats.map((chat) => ({
    ...chat,
    messages: chat.messages.map((message) => {
      let reconstructedParts: MessagePart[] | null = null

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
        id: message.id,
        createdAt: message.createdAt,
        userId: message.userId,
        content: message.content,
        role: message.role,
        chatId: message.chatId,
        parts: reconstructedParts,
      }
    }),
  }))
}
