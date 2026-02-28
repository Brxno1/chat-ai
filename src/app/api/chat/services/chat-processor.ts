import { type UIMessage } from 'ai'
import { after } from 'next/server'

import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
} from '@/actions/chat/chat-operations'
import {
  ProcessChatAndSaveMessagesProps,
  ProcessChatAndSaveMessagesResponse,
} from '@/types/chat'

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

  const systemMessage: UIMessage = {
    id: 'system',
    role: 'system',
    parts: [
      {
        type: 'text',
        text: generateSystemPrompt({
          name: userName || '',
          isLoggedIn: !!userId,
        }),
      },
    ],
  }

  const finalMessages: UIMessage[] = [systemMessage, ...processedMessages]

  const chatId = headerChatId || crypto.randomUUID()
  const isNewChat = !headerChatId

  if (!isGhostChatMode && userId) {
    try {
      const { success, error } = await findOrCreateChat(chatId, userId)

      if (!success) {
        console.error('Failed to create/find chat:', error)
      }
      const messagesToSave = isNewChat
        ? processedMessages
        : [lastMessage].filter((msg) => msg?.role === 'user')

      const { processedAttachments } = await processAttachments(
        messagesToSave,
        userId,
        chatId,
      )

      await saveMessages(messagesToSave, chatId, userId, processedAttachments)
    } catch (error) {
      console.error('Error in synchronous chat creation/saving:', error)
    }
  }

  const { streamResult, streamError } = await createStreamText({
    messages: finalMessages,
    modelId,
    onFinish: (event) => {
      if (isGhostChatMode || !userId) return

      after(async () => {
        try {
          const content = event.content.filter(
            (part) => part.type !== 'tool-call',
          )

          const { success: saveSuccess, error: saveError } =
            await saveChatResponse({ content, chatId, userId })

          if (!saveSuccess) {
            console.error('Failed to save chat response:', saveError)
          }

          // if (finalMessages.length >= 2) {
          //   await generateTitle(chatId, finalMessages)
          // }
        } catch (error) {
          console.error('after background task error:', error)
        }
      })
    },
  })

  if (streamError || !streamResult) {
    return {
      stream: streamResult,
      error: streamError || undefined,
    }
  }

  if (isGhostChatMode || !userId) {
    return {
      stream: streamResult,
      headerChatId: undefined,
    }
  }

  return {
    stream: streamResult,
    headerChatId: chatId,
  }
}
