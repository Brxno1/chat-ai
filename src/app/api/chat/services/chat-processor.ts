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
    const { stream, error } = await createStreamText({
      messages: finalMessages,
      modelId,
    })

    return {
      stream,
      error: error || undefined,
      headerChatId: undefined,
    }
  }

  const findOrCreate = await findOrCreateChat(headerChatId, userId)

  if (!findOrCreate.success) {
    return {
      stream: null,
      error: findOrCreate.error || 'Failed to create chat',
    }
  }

  const finalChatId = findOrCreate.data
  const isNewChat = !headerChatId

  if (isNewChat || processedMessages.length > 0) {
    /* eslint-disable */
    const messagesToSave = isNewChat
      ? processedMessages
      : [processedMessages[processedMessages.length - 1]].filter(
        (msg) => msg?.role === 'user',
      )
    /* eslint-enable */
    if (messagesToSave.length > 0) {
      await saveMessages(messagesToSave, finalChatId, userId, attachments)
    }
  }

  if (finalMessages.length >= 3) {
    setImmediate(async () => {
      try {
        const { title } = await generateChatTitle(finalMessages)

        await prisma.chat.update({
          where: { id: finalChatId },
          data: { title },
        })
      } catch (error) {
        console.error('Failed to update chat title asynchronously:', error)
      }
    })
  }

  const { stream, error } = await createStreamText({
    messages: finalMessages,
    modelId,
  })

  if (error) {
    return {
      stream: null,
      error,
    }
  }

  saveChatResponse({
    stream: stream!,
    chatId: finalChatId,
    userId,
  })

  return {
    stream,
    headerChatId: finalChatId,
  }
}
