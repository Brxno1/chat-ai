'use server'

import { Message } from '@ai-sdk/react'
import { StreamTextResult } from 'ai'

import { prisma } from '@/services/database/prisma'
import { DbMessage } from '@/types/chat'

import { TextUIPart } from '../../../../../@types/ai-sdk'
import { weatherTool } from '../tools/weather'
import { errorHandler } from '../utils/error-handler'
import { processStreamResult } from '../utils/message-parts'

type AllTools = {
  getWeather: typeof weatherTool
}

type OperationResponse<T> = {
  success: boolean
  data: T
  error?: string
}

async function findOrCreateChat(
  messages: Message[],
  chatId?: string,
  userId?: string,
): Promise<OperationResponse<string>> {
  if (chatId) return { success: true, data: chatId }

  if (!userId) {
    return {
      success: false,
      error: 'User ID not provided',
      data: '',
    }
  }

  const lastUserMessage = messages
    .slice()
    .reverse()
    .find((msg) => msg.role.toLowerCase() === 'user')

  const chatTitle = lastUserMessage?.parts
    ? lastUserMessage.parts.toLocaleString().substring(0, 50)
    : 'Novo Chat'

  try {
    const chat = await prisma.chat.create({
      data: {
        title: chatTitle,
        userId,
      },
    })

    return { success: true, data: chat.id }
  } catch (error) {
    return {
      success: false,
      error: errorHandler(error),
      data: '',
    }
  }
}

// function isConsecutiveDuplicate(
//   lastMessage: DbMessage,
//   role: string,
//   content: string,
// ): boolean {
//   if (lastMessage.role !== role) return false

//   try {
//     const lastParts =
//       typeof lastMessage.parts === 'string'
//         ? JSON.parse(lastMessage.parts)
//         : lastMessage.parts

//     if (Array.isArray(lastParts)) {
//       const lastText = lastParts
//         .filter((p) => p?.type === 'text' && p?.text)
//         .map((p) => p.text)
//         .join(' ')
//       return lastText === content
//     }
//   } catch (error) {
//     return false
//   }

//   return false
// }

async function saveMessages(
  messagesToSave: Message[],
  chatId: string,
  userId: string,
): Promise<OperationResponse<null>> {
  try {
    const messagesToCreate: Array<{
      userId: string
      role: 'USER' | 'ASSISTANT'
      chatId: string
      parts: string
    }> = []

    await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
    })

    for (const message of messagesToSave) {
      const role = message.role.toLowerCase() === 'user' ? 'USER' : 'ASSISTANT'

      const textParts = message
        .parts!.filter((part) => part.type === 'text' && part.text)
        .map((part) => (part as TextUIPart).text)
        .join(' ')

      const parts = [{ type: 'text', text: textParts }]
      const partsString = JSON.stringify(parts)

      messagesToCreate.push({
        userId,
        role,
        chatId,
        parts: partsString,
      })
    }

    if (messagesToCreate.length > 0) {
      await prisma.message.createMany({
        data: messagesToCreate,
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

type ChatResponse = {
  stream: StreamTextResult<AllTools, never>
  chatId: string
  originalChatId?: string
  messages?: Message[]
  userId: string
}

async function saveChatResponse({
  stream,
  chatId,
  originalChatId,
  messages,
  userId,
}: ChatResponse) {
  if (!chatId)
    return { success: false, error: 'Chat ID not provided', data: null }

  setImmediate(async () => {
    try {
      const { parts } = await processStreamResult(stream)

      await prisma.$transaction(async (tx) => {
        const partsToSave = JSON.stringify(parts, null, 2)

        await tx.message.create({
          data: {
            role: 'ASSISTANT',
            chatId,
            parts: partsToSave,
            userId,
          },
        })

        if (!originalChatId && messages?.length) {
          const userMessages = messages
            .filter((msg) => msg.role.toLowerCase() === 'user')
            .map((msg) => {
              if (msg.parts && Array.isArray(msg.parts)) {
                const textParts = msg.parts
                  .filter((part) => part.type === 'text' && part.text)
                  .map((part) => (part as TextUIPart).text)
                  .join(' ')
                return textParts
              }
              return ''
            })
            .filter(Boolean)

          const title = userMessages[0]?.substring(0, 50) || 'Novo Chat'
          await tx.chat.update({
            where: { id: chatId },
            data: { title },
          })
        }
      })
    } catch (error) {
      return { success: false, error: errorHandler(error), data: null }
    }
  })

  return { success: true, data: null }
}

export { findOrCreateChat, saveChatResponse, saveMessages }
