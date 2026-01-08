import { type Message } from 'ai'

import { generateTitle } from '@/actions/chat/generate-title'
import {
  ProcessChatAndSaveMessagesProps,
  ProcessChatAndSaveMessagesResponse,
} from '@/types/chat'

import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
} from '../../../../actions/chat/chat-operations'
import { generateSystemPrompt } from '../prompts'
import { processToolInvocations } from '../utils/message-filter'
import { createStreamText } from './create-stream-text'
import { processAttachments } from './processes-attachments'

export async function processChatAndSaveMessages({
  messages,
  userName,
  headerChatId,
  userId,
  isGhostChatMode,
  modelId,
}: ProcessChatAndSaveMessagesProps): Promise<ProcessChatAndSaveMessagesResponse> {
  const processedMessages = processToolInvocations(messages)
  const lastMessage = processedMessages[processedMessages.length - 1]

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

  const chatId = headerChatId || crypto.randomUUID()
  const isNewChat = !headerChatId

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

  setImmediate(async () => {
    try {
      const { success, error } = await findOrCreateChat(chatId, userId)

      if (!success) {
        console.error('Failed to create/find chat:', error)
        return
      }

      const { processedAttachments } = await processAttachments(
        lastMessage,
        userId,
        chatId,
      )

      const messagesToSave = isNewChat
        ? processedMessages
        : [lastMessage].filter((msg) => msg?.role === 'user')

      await saveMessages(messagesToSave, chatId, userId, processedAttachments)

      const { success: saveSuccess, error: saveError } = await saveChatResponse(
        {
          stream: streamResult,
          chatId,
          userId,
        },
      )

      if (!saveSuccess) {
        console.error('Failed to save chat response:', saveError)
      }

      if (finalMessages.length >= 2) {
        await generateTitle(chatId, finalMessages)
      }
    } catch (error) {
      console.error('Background task error:', error)
    }
  })

  return {
    stream: streamResult,
    headerChatId: chatId,
  }
}
