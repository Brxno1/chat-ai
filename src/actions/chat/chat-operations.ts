'use server'

import { type UIMessage } from 'ai'

import type { MessageRole, Prisma } from '@/services/database/generated'
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
    const { id } = await prisma.chat.upsert({
      where: { id: chatId },
      update: {},
      create: {
        id: chatId,
        title: 'Nova conversa',
        userId,
      },
      select: { id: true },
    })

    return { success: true, data: id }
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
    for (const [index, message] of messagesToSave.entries()) {
      const isLastMessage = index === messagesToSave.length - 1
      const { role, parts } = formatMessageForStorage(
        message,
        isLastMessage ? attachments : undefined,
      )

      if (role === 'USER' && isLastMessage && attachments) {
        await prisma.$transaction(async (tx) => {
          const createdMessage = await tx.message.create({
            data: {
              userId,
              role,
              chatId,
              parts,
            },
          })

          const validAttachments: Prisma.AttachmentCreateManyInput[] = []

          for (const attachment of attachments) {
            validAttachments.push({
              name: attachment.name,
              contentType: attachment.contentType,
              url: attachment.url,
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
            role: role as MessageRole,
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

async function saveChatResponse({
  content,
  chatId,
  userId,
}: ChatResponsePayload): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.message.create({
      data: {
        role: 'ASSISTANT',
        chatId,
        parts: JSON.stringify(content, (key, value) =>
          key === 'providerMetadata' ? undefined : value,
        ),
        userId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error(`Error saving chat response for chat ${chatId}:`, error)
    return { success: false, error: errorHandler(error) }
  }
}

export { findOrCreateChat, saveChatResponse, saveMessages }
