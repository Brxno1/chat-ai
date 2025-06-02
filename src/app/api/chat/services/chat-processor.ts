import { openai } from '@ai-sdk/openai'
import { Message, streamText } from 'ai'

import {
  getOrCreateChat,
  saveMessages,
  saveResponseWhenComplete,
} from '../actions/chat-operations'
import { chatConfig } from '../config'
import { generateSystemPrompt } from '../prompts'

type ProcessChatAndSaveMessagesParams = {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  name?: string
  locale: string
  chatId?: string
  userId?: string
  model: string
  isGhostChatMode?: boolean
}

type ProcessChatAndSaveMessagesResponse = {
  stream: ReturnType<typeof streamText> | null
  chatId?: string
  error?: string
}

export async function processChatAndSaveMessages({
  messages,
  name,
  locale,
  chatId,
  userId,
  model,
  isGhostChatMode,
}: ProcessChatAndSaveMessagesParams): Promise<ProcessChatAndSaveMessagesResponse> {
  if (isGhostChatMode || !userId) {
    const promptMessages: Message[] = [
      {
        id: 'system',
        role: 'system',
        content: generateSystemPrompt(name ?? '', locale),
      } as Message,
      ...(messages.map((message, index) => ({
        id: `message-${index}`,
        ...message,
      })) as Message[]),
    ]

    const stream = streamText({
      model: openai(model),
      temperature: chatConfig.temperature,
      maxTokens: chatConfig.maxTokens,
      messages: promptMessages,
    })

    return {
      stream,
      chatId: undefined,
    }
  }

  const chatResponse = await getOrCreateChat(userId, chatId, messages)

  if (!chatResponse.success && userId) {
    return {
      stream: null,
      error: chatResponse.error || 'Failed to create chat',
    }
  }

  const chat = chatResponse.data

  const promptMessages: Message[] = [
    {
      id: 'system',
      role: 'system',
      content: generateSystemPrompt(name || '', locale),
    } as Message,
    ...(messages.map((message, index) => ({
      id: `message-${index}`,
      ...message,
    })) as Message[]),
  ]

  const stream = streamText({
    model: openai(model),
    temperature: chatConfig.temperature,
    maxTokens: chatConfig.maxTokens,
    messages: promptMessages,
  })

  if (userId && chat) {
    const { success, error } = await saveMessages(messages, chat.id)

    if (!success) {
      console.warn('Failed to save messages:', error)
    }

    saveResponseWhenComplete(stream, chat.id, chatId, messages)
      .then(({ success, error }) => {
        if (!success) {
          console.warn('Failed to save assistant response:', error)
        }
      })
      .catch(console.error)
  }

  return {
    stream,
    chatId: chat?.id,
  }
}
