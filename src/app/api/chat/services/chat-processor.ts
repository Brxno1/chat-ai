import { Message } from '@ai-sdk/react'

import { prisma } from '@/services/database/prisma'
import {
  ProcessChatAndSaveMessagesProps,
  ProcessChatAndSaveMessagesResponse,
} from '@/types/chat'

import { generateSystemPrompt } from '../prompts'
import { processToolInvocations } from '../utils/message-filter'
import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
} from './chat-operations'
import { createStreamText } from './create-stream-text'
import { generateChatTitle } from './generate-chat-title'

export async function processChatAndSaveMessages({
  messages,
  userName,
  headerChatId,
  userId,
  isGhostChatMode,
  modelId,
  attachments,
}: ProcessChatAndSaveMessagesProps): Promise<ProcessChatAndSaveMessagesResponse> {
  const processedMessages = processToolInvocations(messages)

  const finalMessages: Message[] = [
    {
      id: 'system',
      role: 'system',
      content: generateSystemPrompt({
        name: userName || '',
        isLoggedIn: !!userId,
      }),
    },
    ...processedMessages.map((message) => ({
      ...message,
    })),
  ]

  if (isGhostChatMode || !userId) {
    const { streamResult, streamError } = await createStreamText({
      messages: finalMessages,
      modelId,
    })

    return {
      stream: streamResult,
      error: streamError || undefined,
      headerChatId: undefined,
    }
  }

  const {
    success,
    data: finalChatId,
    error,
  } = await findOrCreateChat(headerChatId, userId)

  if (!success) {
    return {
      stream: null,
      error: error || 'Failed to create chat',
    }
  }

  const isNewChat = !headerChatId

  if (isNewChat || processedMessages.length > 0) {
    /* eslint-disable */
    const messagesToSave = isNewChat
      ? processedMessages
      : [processedMessages[processedMessages.length - 1]].filter(
        (msg) => msg?.role === 'user',
      )
    /* eslint-enable */
    await saveMessages(messagesToSave, finalChatId, userId, attachments)
  }

  if (finalMessages.length >= 2) {
    setImmediate(async () => {
      try {
        const messageCount = await prisma.message.count({
          where: { chatId: finalChatId },
        })
        if (messageCount % 5 === 0) {
          const { title } = await generateChatTitle(finalMessages)
          await prisma.chat.update({
            where: { id: finalChatId },
            data: { title },
          })
        }
      } catch (error) {
        console.error('Failed to update chat title asynchronously:', error)
      }
    })
  }

  const { streamResult, streamError } = await createStreamText({
    messages: finalMessages,
    modelId,
  })

  if (streamError || !streamResult) {
    return {
      stream: streamResult,
      error: streamError || undefined,
    }
  }

  saveChatResponse({
    stream: streamResult,
    chatId: finalChatId,
    userId,
  })

  return {
    stream: streamResult,
    headerChatId: finalChatId,
  }
}
