'use server'

import { StreamTextResult } from 'ai'

import { Message } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'

import { weatherTool } from '../tools/weather'
import { errorHandler } from '../utils/error-handler'
import { processStreamResult } from '../utils/message-parts'

type AllTools = {
  getWeather: typeof weatherTool
}

type Role = 'user' | 'assistant'

type OperationResponse<T> = {
  success: boolean
  data: T
  error?: string
}

async function findOrCreateChat(
  messages: Array<{ role: Role; content: string }>,
  chatId?: string,
  name?: string,
  userId?: string,
): Promise<OperationResponse<string>> {
  if (chatId) return { success: true, data: chatId }

  if (!userId) {
    return {
      success: false,
      error: 'User ID não fornecido',
      data: '',
    }
  }

  const lastUserMessage = messages
    .slice()
    .reverse()
    .find((msg) => msg.role === 'user')

  const chatTitle = lastUserMessage?.content
    ? lastUserMessage.content.substring(0, 50)
    : name || 'Novo Chat'

  try {
    const chat = await prisma.chat.create({
      data: {
        title: chatTitle,
        userId,
      },
    })

    return { success: true, data: chat.id }
  } catch (error) {
    console.error('FindOrCreateChat.ts:', error)
    return {
      success: false,
      error: errorHandler(error),
      data: '',
    }
  }
}

function isConsecutiveDuplicate(
  lastMessage: Message,
  role: string,
  content: string,
): boolean {
  if (lastMessage.role !== role) return false

  try {
    const lastParts =
      typeof lastMessage.parts === 'string'
        ? JSON.parse(lastMessage.parts)
        : lastMessage.parts

    if (Array.isArray(lastParts)) {
      const lastText = lastParts
        .filter((p) => p?.type === 'text' && p?.text)
        .map((p) => p.text)
        .join(' ')
      return lastText === content
    }
  } catch (error) {
    console.error('Error comparing parts:', error)
  }

  return false
}

async function saveMessages(
  messagesToSave: Array<{ role: Role; content: string }>,
  chatId: string,
): Promise<OperationResponse<null>> {
  try {
    const messagesToCreate: Array<{
      role: 'USER' | 'ASSISTANT'
      chatId: string
      parts: string
    }> = []

    let existingMessages: Message[] = []

    if (messagesToSave.length === 1) {
      existingMessages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })
    }

    for (const message of messagesToSave) {
      const role = message.role === 'user' ? 'USER' : 'ASSISTANT'
      const content = message.content

      const parts = [{ type: 'text', text: content }]
      const partsString = JSON.stringify(parts)

      const isDuplicate =
        existingMessages.length > 0 &&
        isConsecutiveDuplicate(existingMessages[0], role, content)

      if (!isDuplicate) {
        messagesToCreate.push({
          role,
          chatId,
          parts: partsString,
        })
      }
    }

    if (messagesToCreate.length > 0) {
      await prisma.message.createMany({
        data: messagesToCreate,
      })
    }

    return { success: true, data: null }
  } catch (error) {
    console.error('SaveMessages.ts:', error)
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
      const { parts } = await processStreamResult(stream)

      const hasToolInteraction = parts?.some(
        (part) => part.type === 'tool-invocation',
      )

      const hasReasoning = parts?.some((part) => part.type === 'reasoning')

      const shouldSaveParts = hasToolInteraction || hasReasoning

      await prisma.$transaction(async (tx) => {
        const partsToSave = shouldSaveParts
          ? JSON.stringify(parts, null, 2)
          : undefined

        await tx.message.create({
          data: {
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
      console.error('SaveChatResponse.ts:', error)
    }
  })

  return { success: true, data: null }
}

export { findOrCreateChat, saveChatResponse, saveMessages }
