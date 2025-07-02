/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import { StreamTextResult } from 'ai'

import { prisma } from '@/services/database/prisma'

import { errorHandler } from '../route'
import { processStreamResult } from '../utils/message-parts'

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
  try {
    for (const msg of messages) {
      const existingMessage = await prisma.message.findFirst({
        where: {
          chatId,
          content: msg.content,
          role: msg.role === 'user' ? 'USER' : 'ASSISTANT',
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      if (!existingMessage) {
        await prisma.message.create({
          data: {
            content: msg.content,
            role: msg.role === 'user' ? 'USER' : 'ASSISTANT',
            chatId,
          },
        })
      }
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
  stream: StreamTextResult<any, never>,
  chatId: string,
  originalChatId?: string,
  messages?: Array<{ role: Role; content: string }>,
): Promise<OperationResponse<null>> {
  if (!chatId)
    return { success: false, error: 'Chat ID not provided', data: null }

  console.log('📝 saveChatResponse iniciado para chatId:', chatId)

  // Salvar em background sem bloquear a resposta
  setImmediate(async () => {
    console.log('⏰ setImmediate executado - iniciando processamento do stream')
    try {
      // Processar o stream para extrair texto e parts
      const { text: fullText, parts } = await processStreamResult(stream)

      console.log('🔍 Stream processado:', {
        fullText: fullText?.substring(0, 100) + '...',
        hasParts: !!parts,
        partsCount: parts ? (Array.isArray(parts) ? parts.length : 1) : 0,
      })

      await prisma.$transaction(async (tx) => {
        const existingMessage = await tx.message.findFirst({
          where: {
            chatId,
            role: 'ASSISTANT',
            content: fullText || 'tool-invocation-response',
          },
          orderBy: { createdAt: 'desc' },
        })

        console.log('🔎 Verificação de mensagem existente:', !!existingMessage)

        if (!existingMessage) {
          const partsToSave = parts ? JSON.stringify(parts, null, 2) : undefined

          await tx.message.create({
            data: {
              content: fullText || 'tool-invocation-response',
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
              console.log('📝 Título do chat atualizado:', title)
            }
          }
        } else {
          console.log('ℹ️ Mensagem já existe no banco, pulando salvamento')
        }
      })
    } catch (error) {
      console.error('❌ Error saving response in background:', error)
    }
  })

  // Retornar imediatamente sem aguardar o salvamento
  return { success: true, data: null }
}

export { findOrCreateChat, saveMessages, saveChatResponse }
