/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import { StreamTextResult } from 'ai'

import { prisma } from '@/services/database/prisma'

import { errorHandler } from '../route'
import { weatherTool } from '../tools/weather'
import { processStreamResult } from '../utils/message-parts'

type AllTools = {
  getWeather: typeof weatherTool
}

type Role = 'user' | 'assistant'

type OperationResponse<T = any> = {
  data: T
  error?: string
  success: boolean
}

async function findOrCreateChat(
  userId?: string,
  chatId?: string,
  messages?: Array<{ role: Role; content: string }>,
): Promise<OperationResponse<any>> {
  try {
    if (chatId) {
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

      return { success: true, data: chat }
    }

    if (userId && messages?.length) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((msg) => msg.role === 'user')

      const title = lastUserMessage
        ? lastUserMessage.content.substring(0, 50)
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
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
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
      error: errorHandler(error),
      data: null,
    }
  }
}

async function saveMessages(
  messages: Array<{ role: Role; content: string }>,
  chatId: string,
): Promise<OperationResponse<null>> {
  console.log('saveMessages', { messages, chatId })
  try {
    const existingMessages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        content: true,
        role: true,
        createdAt: true,
      },
    })

    const messagesToCreate: Array<{
      content: string
      role: 'USER' | 'ASSISTANT'
      chatId: string
    }> = []

    for (const msg of messages) {
      const role = msg.role === 'user' ? 'USER' : 'ASSISTANT'
      const content = msg.content

      const isConsecutiveDuplicate =
        existingMessages.length > 0 &&
        existingMessages[0].content === content &&
        existingMessages[0].role === role

      if (!isConsecutiveDuplicate) {
        messagesToCreate.push({
          content,
          role,
          chatId,
        })
      }
    }

    if (messagesToCreate.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const data of messagesToCreate) {
          await tx.message.create({ data })
        }
      })
    }

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: errorHandler(error),
      data: null,
    }
  }
}

async function saveChatResponse(
  stream: StreamTextResult<AllTools, never>,
  chatId: string,
  originalChatId?: string,
  messages?: Array<{ role: Role; content: string }>,
): Promise<OperationResponse<null>> {
  if (!chatId)
    return { success: false, error: 'Chat ID not provided', data: null }

  setImmediate(async () => {
    try {
      const { text, parts } = await processStreamResult(stream)

      const hasToolInteraction = parts?.some(
        (part) =>
          part.type === 'tool-invocation' || part.type === 'tool-result',
      )

      const shouldSaveParts = hasToolInteraction

      await prisma.$transaction(async (tx) => {
        const partsToSave = shouldSaveParts
          ? JSON.stringify(parts, null, 2)
          : undefined

        await tx.message.create({
          data: {
            content: text || '[Response from Tools]',
            role: 'ASSISTANT',
            chatId,
            parts: partsToSave,
          },
        })

        if (!originalChatId && messages?.length) {
          const userMessages = messages
            .filter((msg) => msg.role === 'user')
            .map((msg) => msg.content)

          if (userMessages.length) {
            const title = userMessages[0].substring(0, 50)
            await tx.chat.update({
              where: { id: chatId },
              data: { title },
            })
          }
        }
      })
    } catch (error) {
      console.error('❌ Error saving response in background:', error)
    }
  })

  return { success: true, data: null }
}

export { findOrCreateChat, saveMessages, saveChatResponse }
