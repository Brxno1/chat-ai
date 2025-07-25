'use server'

import { Message } from '@ai-sdk/react'
import { StreamTextResult } from 'ai'

import type { Prisma } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'
import { AllTools } from '@/types/chat'

import { errorHandler } from '../utils/error-handler'
import { formatMessageForStorage } from '../utils/message-processor'
import { processStreamResult } from './process-stream-result'

type OperationResponse<T> = {
  success: boolean
  data: T
  error?: string
}

async function findOrCreateChat(
  chatId?: string,
  userId?: string,
): Promise<OperationResponse<string>> {
  if (!userId) {
    return {
      success: false,
      error: 'User ID not provided',
      data: '',
    }
  }

  if (chatId) {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId,
      },
    })
    if (chat) {
      return { success: true, data: chat.id }
    }
  }

  try {
    const chat = await prisma.chat.create({
      data: {
        id: chatId || undefined,
        title: 'Nova conversa',
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
  messagesToSave: Message[],
  chatId: string,
  userId: string,
  attachments?: {
    name: string
    contentType: string
    url: string
  }[],
): Promise<OperationResponse<null>> {
  try {
    for (const message of messagesToSave) {
      const { role, parts } = formatMessageForStorage(message)

      if (role === 'USER' && attachments) {
        await prisma.$transaction(async (tx) => {
          const createdMessage = await tx.message.create({
            data: {
              userId,
              role: 'USER',
              chatId,
              parts,
            },
          })

          const validAttachments: Prisma.AttachmentCreateManyInput[] = []

          for (const attch of attachments) {
            validAttachments.push({
              name: attch.name,
              contentType: attch.contentType,
              url: attch.url,
              createdAt: new Date(),
              messageId: createdMessage.id,
            })
          }

          if (validAttachments.length > 0) {
            await tx.attachment.createMany({
              data: validAttachments,
            })
          }
        })
      } else {
        await prisma.message.create({
          data: {
            userId,
            role: role as 'USER' | 'ASSISTANT',
            chatId,
            parts,
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

type ChatResponse = {
  stream: StreamTextResult<AllTools, never>
  chatId: string
  userId: string
}

function saveChatResponse({
  stream,
  chatId,
  userId,
}: ChatResponse): Promise<OperationResponse<null>> {
  const processingPromise = new Promise<OperationResponse<null>>((resolve) => {
    setImmediate(async () => {
      try {
        const { parts } = await processStreamResult(stream)

        await prisma.message.create({
          data: {
            role: 'ASSISTANT',
            chatId,
            parts: JSON.stringify(parts),
            userId,
          },
        })

        resolve({ success: true, data: null })
      } catch (error) {
        console.error(`Error saving chat response for chat ${chatId}:`, error)
        resolve({
          success: false,
          error: errorHandler(error),
          data: null,
        })
      }
    })
  })

  return processingPromise
}

export { findOrCreateChat, saveChatResponse, saveMessages }
