import { Message, StreamTextResult } from 'ai'

import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
} from '../actions/chat-operations'
import { generateSystemPrompt } from '../prompts'
import { countTodosTool } from './counter-todos-tool'
import { createStreamText } from './create-stream-text'
import { weatherTool } from './weather'

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
  count_todos: typeof countTodosTool
  displayWeather: typeof weatherTool
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
  const validMessages = messages.filter(
    (msg) => msg.content && msg.content.trim() !== '',
  )
  const lastMessage = validMessages[validMessages.length - 1]
  const isWeatherQuery =
    lastMessage?.content?.toLowerCase().includes('tempo') ||
    lastMessage?.content?.toLowerCase().includes('clima') ||
    lastMessage?.content?.toLowerCase().includes('weather') ||
    lastMessage?.content?.toLowerCase().includes('temperatura')

  const contextMessages = isWeatherQuery
    ? [lastMessage]
    : validMessages.slice(-4)

  const promptMessages: Message[] = [
    {
      id: 'system',
      role: 'system',
      content: generateSystemPrompt({
        name: name || '',
        isLoggedIn: !!userId,
      }),
    },
    ...contextMessages.map((message, index) => ({
      id: `message-${index}`,
      role: message.role,
      content: message.content,
    })),
  ]

  if (isGhostChatMode || !userId) {
    const { stream, error } = await createStreamText({
      messages: promptMessages,
      userId,
    })

    return {
      stream,
      error: error || undefined,
      chatId: undefined,
    }
  }

  const chatResponse = await findOrCreateChat(userId, chatId, validMessages)

  if (!chatResponse.success) {
    return {
      stream: null,
      error: chatResponse.error || 'Failed to create chat',
    }
  }

  const chat = chatResponse.data

  const { stream, error } = await createStreamText({
    messages: promptMessages,
    userId,
  })

  if (error) {
    return {
      stream: null,
      error: error ?? 'Error creating stream.',
    }
  }

  if (validMessages.length > 0) {
    const lastUserMessage = validMessages[validMessages.length - 1]

    if (lastUserMessage.role === 'user') {
      const { success, error: saveError } = await saveMessages(
        [lastUserMessage],
        chat!.id,
      )
      if (!success) {
        console.warn('Failed to save user message:', saveError)
      }
    }
  }

  try {
    await saveChatResponse(stream!, chat!.id, chatId, validMessages)
  } catch (error) {
    console.error('Error saving response:', error)
  }

  return {
    stream,
    chatId: chat!.id,
  }
}
