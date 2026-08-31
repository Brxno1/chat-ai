'use server'

import { type UIMessage } from 'ai'

import { prisma } from '@/services/database/prisma'
import { type ChatResponsePayload } from '@/types/chat'

import { errorHandler } from '../../app/api/chat/utils/error-handler'
import { formatMessageForStorage } from '../../app/api/chat/utils/message-processor'

type OperationResponse<T> = {
  data: T
  success: boolean
  error?: string
}

async function findOrCreateChat(
  chatId: string,
  userId: string,
): Promise<OperationResponse<string>> {
  try {
    const chat = await prisma.chat.upsert({
      where: { id: chatId },
      update: {},
      create: {
        id: chatId,
        title: 'Nova conversa',
        userId,
      },
      select: { id: true, userId: true },
    })

    if (chat.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized chat access',
        data: '',
      }
    }

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
  messagesToSave: UIMessage[],
  chatId: string,
  userId: string,
  attachments?: {
    name: string
    contentType: string
    url: string
  }[],
): Promise<OperationResponse<null>> {
  try {
    await prisma.$transaction(async (tx) => {
      const chat = await tx.chat.findFirst({
        where: { id: chatId, userId },
        select: { id: true },
      })

      if (!chat) {
        throw new Error('Unauthorized chat access')
      }

      for (const [index, message] of messagesToSave.entries()) {
        const isLastMessage = index === messagesToSave.length - 1
        const { role, parts } = formatMessageForStorage(
          message,
          isLastMessage ? attachments : undefined,
        )

        const createdMessage = await tx.message.create({
          data: {
            userId,
            role,
            chatId,
            parts: JSON.stringify(parts),
          },
        })

        if (role === 'USER' && isLastMessage && attachments?.length) {
          const validAttachments = attachments.map((att) => ({
            name: att.name,
            contentType: att.contentType,
            url: att.url,
            createdAt: new Date(),
            messageId: createdMessage.id,
          }))

          await tx.attachment.createMany({
            data: validAttachments,
          })
        }
      }
    })

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: errorHandler(error),
      data: null,
    }
  }
}

async function saveChatResponse({
  content,
  chatId,
  userId,
  metadata,
}: ChatResponsePayload): Promise<{ success: boolean; error?: string }> {
  try {
    const hasChat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      select: { id: true },
    })

    if (!hasChat) {
      return { success: false, error: 'Chat not found' }
    }

    await prisma.message.create({
      data: {
        role: 'ASSISTANT',
        chatId,
        userId,
        parts: JSON.stringify(content),
        metadata: JSON.stringify(metadata),
      },
    })

    return { success: true }
  } catch (error) {
    console.error(`Error saving chat response for chat ${chatId}:`, error)
    return { success: false, error: errorHandler(error) }
  }
}

async function updateAssistantMessage({
  messageId,
  chatId,
  userId,
  content,
  metadata,
}: {
  messageId: string
  chatId: string
  userId: string
  content: ChatResponsePayload['content']
  metadata?: Record<string, unknown>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { count } = await prisma.message.updateMany({
      where: {
        id: messageId,
        chatId,
        userId,
        role: 'ASSISTANT',
      },
      data: {
        parts: JSON.stringify(content),
        metadata: JSON.stringify({
          ...metadata,
          regeneratedAt: Date.now(),
        }),
      },
    })

    if (count === 0) {
      return { success: false, error: 'Assistant message not found' }
    }

    return { success: true }
  } catch (error) {
    console.error(`Error updating assistant message ${messageId}:`, error)
    return { success: false, error: errorHandler(error) }
  }
}

export {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
  updateAssistantMessage,
}
