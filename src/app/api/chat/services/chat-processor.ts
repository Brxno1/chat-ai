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

  const {
    success,
    data: finalChatId,
    error,
  } = await findOrCreateChat(headerChatId, userId)

  if (!success) {
    return {
      stream: null,
      error: error || undefined,
    }
  }

  const { processedAttachments } = await processAttachments(
    lastMessage,
    userId,
    finalChatId,
  )

  const isNewChat = !headerChatId

  const messagesToSave = isNewChat
    ? processedMessages
    : [lastMessage].filter((msg) => msg?.role === 'user')

  await saveMessages(messagesToSave, finalChatId, userId, processedAttachments)

  if (finalMessages.length >= 2) {
    setImmediate(async () => {
      await generateTitle(finalChatId, finalMessages)
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

  setImmediate(async () => {
    const { success, error } = await saveChatResponse({
      stream: streamResult,
      chatId: finalChatId,
      userId,
    })

    if (!success) {
      console.error(error)
    }
  })

  return {
    stream: streamResult,
    headerChatId: finalChatId,
  }
}
