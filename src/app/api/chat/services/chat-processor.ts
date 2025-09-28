import { type Message } from 'ai'

import {
  ProcessChatAndSaveMessagesProps,
  ProcessChatAndSaveMessagesResponse,
} from '@/types/chat'

import { generateTitle } from '../actions/generate-title'
import { uploadChatImage } from './upload-chat-image'
import { generateSystemPrompt } from '../prompts'
import { processToolInvocations } from '../utils/message-filter'
import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
} from '../actions/chat-operations'
import { createStreamText } from './create-stream-text'

export async function processChatAndSaveMessages({
  messages,
  userName,
  headerChatId,
  userId,
  isGhostChatMode,
  modelId,
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

  const processedAttachments: {
    url: string
    name: string
    contentType: string
  }[] = []

  const { role, experimental_attachments: userAttachments } =
    processedMessages[processedMessages.length - 1]

  if (role === 'user' && userAttachments) {
    const attachments = userAttachments.filter((attachment) => !!attachment)

    if (attachments.length > 0) {
      for await (const attach of attachments) {
        try {
          const isAudio = attach.contentType?.startsWith('audio/')

          if (isAudio) {
            processedAttachments.push({
              url: attach.url,
              name: attach.name || `audio-${new Date().getTime()}.webm`,
              contentType: attach.contentType || 'audio/webm',
            })
            continue
          }

          const result = await uploadChatImage(userId, finalChatId, {
            name: attach.name || new Date().getTime().toString(),
            contentType: attach.contentType || 'image/webp',
            url: attach.url,
          })

          if (result) {
            processedAttachments.push({
              url: result.url,
              name: result.name,
              contentType: result.contentType,
            })
          }
        } catch (error) {
          console.error('Error uploading attachment:', error)
        }
      }
    }
  }

  const isNewChat = !headerChatId

  /* eslint-disable */
  const messagesToSave = isNewChat
    ? processedMessages
    : [processedMessages[processedMessages.length - 1]].filter(
      (msg) => msg?.role === 'user',
    )
  /* eslint-enable */
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
