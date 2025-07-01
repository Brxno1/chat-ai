import { Message, StreamTextResult } from 'ai'

import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
} from '../actions/chat-operations'
import { generateSystemPrompt } from '../prompts'
import { errorHandler } from '../route'
import { weatherTool } from '../tools/weather'
import { createStreamText } from './create-stream-text'

type Role = 'user' | 'assistant'

type ProcessChatAndSaveMessagesParams = {
  messages: Array<{ role: Role; content: string }>
  name?: string
  chatId?: string
  isGhostChatMode?: boolean

  userId?: string
  model?: string
}

type AllTools = {
  getWeather: typeof weatherTool
}

type ProcessChatAndSaveMessagesResponse = {
  stream: StreamTextResult<AllTools, never> | null
  chatId?: string
  error?: string
}

export async function processChatAndSaveMessages({
  messages,
  name,
  chatId,
  userId,
  isGhostChatMode,
}: ProcessChatAndSaveMessagesParams): Promise<ProcessChatAndSaveMessagesResponse> {
  const finalMessages: Message[] = [
    {
      id: 'system',
      role: 'system',
      content: generateSystemPrompt({
        name: name || '',
        isLoggedIn: !!userId,
      }),
    },
    ...messages.map((message, index) => ({
      id: `message-${index}`,
      role: message.role,
      content: message.content,
    })),
  ]

  if (isGhostChatMode || !userId) {
    const { stream, error } = await createStreamText({
      messages: finalMessages,
    })

    return {
      stream,
      error: error || undefined,
      chatId: undefined,
    }
  }

  const chatResponse = await findOrCreateChat(userId, chatId, messages)

  if (!chatResponse.success) {
    return {
      stream: null,
      error: chatResponse.error || 'Failed to create chat',
    }
  }

  const chat = chatResponse.data

  const { stream, error } = await createStreamText({
    messages: finalMessages,
  })

  if (error) {
    return {
      stream: null,
      error: errorHandler(error),
    }
  }

  if (messages.length > 0) {
    const lastUserMessage = messages[messages.length - 1]

    if (lastUserMessage.role === 'user') {
      await saveMessages([lastUserMessage], chat!.id)
    }
  }

  try {
    await saveChatResponse(stream!, chat!.id, chatId, messages)
  } catch (error) {
    console.error('Error saving response:', error)
  }

  return {
    stream,
    chatId: chat!.id,
  }
}
