/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import { StreamTextResult } from 'ai'

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
    return {
      success: false,
      error: errorHandler(error),
      data: '',
    }
  }
}

async function saveMessages(
  messages: Array<{ role: Role; content: string }>,
  chatId: string,
): Promise<OperationResponse<null>> {
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
        parts: true,
        role: true,
        createdAt: true,
      },
    })

    const messagesToCreate: Array<{
      role: 'USER' | 'ASSISTANT'
      chatId: string
      parts: string
    }> = []

    for (const msg of messages) {
      const role = msg.role === 'user' ? 'USER' : 'ASSISTANT'
      const content = msg.content

      // Criar parts com o texto da mensagem
      const parts = [{ type: 'text', text: content }]
      const partsString = JSON.stringify(parts)

      // Verificar duplicação comparando o texto das parts existentes
      const isConsecutiveDuplicate =
        existingMessages.length > 0 &&
        (() => {
          const lastMessage = existingMessages[0]
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
            console.error('Erro ao comparar parts:', error)
          }

          return false
        })()

      if (!isConsecutiveDuplicate) {
        messagesToCreate.push({
          role,
          chatId,
          parts: partsString,
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
      const { parts } = await processStreamResult(stream)

      const hasToolInteraction = parts?.some(
        (part) =>
          part.type === 'tool-invocation' || part.type === 'tool-result',
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
      console.error('❌ Error saving response in background:', error)
    }
  })

  return { success: true, data: null }
}

export { findOrCreateChat, saveChatResponse, saveMessages }
