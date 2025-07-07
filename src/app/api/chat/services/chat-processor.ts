import { Message, StreamTextResult } from 'ai'

import { generateSystemPrompt } from '../prompts'
import { weatherTool } from '../tools/weather'
import { processToolInvocations } from '../utils/message-filter'
import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
} from './chat-operations'
import { createStreamText } from './create-stream-text'

type Role = 'user' | 'assistant'

type ProcessChatAndSaveMessagesProps = {
  messages: Array<{ role: Role; content: string }>
  userName?: string
  headerChatId?: string
  isGhostChatMode?: boolean
  userId?: string
  model?: string
}

type AllTools = {
  getWeather: typeof weatherTool
}

type ProcessChatAndSaveMessagesResponse = {
  stream: StreamTextResult<AllTools, never> | null
  headerChatId?: string
  error?: string
}

export async function processChatAndSaveMessages({
  messages,
  userName,
  headerChatId,
  userId,
  isGhostChatMode,
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
    ...processedMessages.map((message, index) => ({
      id: `message-${index}`,
      ...message,
    })),
  ]

  if (isGhostChatMode || !userId) {
    const { stream, error } = await createStreamText({
      messages: finalMessages,
    })

    return {
      stream,
      error: error || undefined,
      headerChatId: undefined,
    }
  }

  const findOrCreate = await findOrCreateChat(
    processedMessages,
    headerChatId,
    userId,
  )

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
      await saveMessages(messagesToSave, finalChatId, userId)
    }
  }

  const { stream, error } = await createStreamText({
    messages: finalMessages,
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
    originalChatId: headerChatId,
    messages: processedMessages,
    userId,
  })

  return {
    stream,
    headerChatId: finalChatId,
  }
}
