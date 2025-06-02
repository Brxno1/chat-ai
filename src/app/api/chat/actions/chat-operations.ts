'use server'

import { Chat } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

type Role = 'user' | 'assistant'

type OperationResponse<T = Chat | null> = {
  data: T
  error?: string
  success: boolean
}

export async function getOrCreateChat(
  userId?: string,
  chatId?: string,
  messages?: Array<{ role: Role; content: string }>,
): Promise<OperationResponse<Chat | null>> {
  try {
    if (!userId) return { success: true, data: null }

    if (chatId) {
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId,
        },
      })

      return { success: true, data: chat }
    }

    if (userId && messages?.length) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((msg) => msg.role === 'user')

      const title = lastUserMessage
        ? lastUserMessage.content.substring(0, 30)
        : 'Nova conversa'

      const chat = await prisma.chat.create({
        data: {
          title,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      })

      return { success: true, data: chat }
    }

    return { success: false, data: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

export async function saveMessages(
  messages: Array<{ role: Role; content: string }>,
  chatId: string,
): Promise<OperationResponse<null>> {
  try {
    await prisma.message.createMany({
      data: messages.map((msg) => ({
        content: msg.content,
        role: msg.role === 'user' ? 'USER' : 'ASSISTANT',
        chatId,
      })),
    })
    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

export async function saveResponseWhenComplete(
  result: { text: Promise<string> },
  chatId: string,
  originalChatId?: string,
  messages?: Array<{ role: Role; content: string }>,
): Promise<OperationResponse<null>> {
  try {
    const fullText = await result.text

    await prisma.message.create({
      data: {
        content: fullText,
        role: 'ASSISTANT',
        chatId,
      },
    })

    if (!originalChatId && messages?.length) {
      const userMessage =
        messages.find((msg) => msg.role === 'user')?.content || ''

      await prisma.chat.update({
        where: { id: chatId },
        data: {
          title: userMessage.substring(0, 30),
        },
      })
    }

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}
