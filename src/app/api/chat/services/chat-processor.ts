import { Message, streamText } from 'ai'

import {
  findOrCreateChat,
  saveMessages,
  saveResponseWhenComplete,
} from '../actions/chat-operations'
import { generateSystemPrompt } from '../prompts'
import { createStreamText } from './create-stream-text'

type Role = 'user' | 'assistant'

type ProcessChatAndSaveMessagesParams = {
  messages: Array<{ role: Role; content: string }>
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
  const promptMessages: Message[] = [
    {
      id: 'system',
      role: 'system',
      content: generateSystemPrompt(name ?? '', locale),
    } as Message,
    ...messages.map((message, index) => ({
      id: `message-${index}`,
      role: message.role,
      content: message.content,
    })),
  ]

  if (isGhostChatMode || !userId) {
    const { stream, error } = await createStreamText(promptMessages, model)

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
  if (!chat) {
    return { stream: null, error: 'Chat not found.' }
  }

  const { stream, error } = await createStreamText(promptMessages, model)
  if (error) {
    return {
      stream: null,
      error: error ?? 'Error creating stream.',
    }
  }

  const { success, error: saveError } = await saveMessages(messages, chat.id)
  if (!success) {
    console.warn('Failed to save messages:', saveError)
  }

  saveResponseWhenComplete(stream!, chat.id, chatId, messages)
    .then(({ success, error }) => {
      if (!success) {
        console.warn('Failed to save assistant response:', error)
      }
    })
    .catch(console.error)

  return { stream, chatId: chat.id }
}
