import { type UIMessage } from 'ai'
import { after } from 'next/server'

import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
  updateAssistantMessage,
} from '@/actions/chat/chat-operations'
import { updateChatTitle } from '@/actions/chat/generate-title'
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
  regenerateResponseId,
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
  const hasResponseToRegenerate = !!regenerateResponseId

  if (!isGhostChatMode && userId) {
    try {
      const {
        success,
        data: confirmedChatId,
        error,
      } = await findOrCreateChat(chatId, userId)

      if (!success) {
        return {
          stream: null,
          error: error || 'Failed to create/find chat',
          headerChatId: undefined,
        }
      }

      if (!hasResponseToRegenerate) {
        const messagesToSave = isNewChat
          ? processedMessages
          : [lastMessage].filter((msg) => msg?.role === 'user')

        const { processedAttachments } = await processAttachments(
          messagesToSave,
          userId,
          confirmedChatId,
        )

        await saveMessages(
          messagesToSave,
          confirmedChatId,
          userId,
          processedAttachments,
        )
      }
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
          const content = event.content
            .filter((part) => part.type !== 'tool-call')
            .map((part) => {
              const cleanPart = { ...part }

              if ('providerMetadata' in cleanPart) {
                delete cleanPart.providerMetadata
              }
              if (cleanPart.type === 'text') {
                cleanPart.text = cleanPart.text.trim()
              }
              return cleanPart
            })

          if (hasResponseToRegenerate) {
            const { success, error } = await updateAssistantMessage({
              messageId: regenerateResponseId,
              chatId,
              userId,
              content,
              metadata: {
                totalTokens: event.totalUsage.totalTokens,
              },
            })

            if (!success) {
              console.error('Failed to update assistant message:', error)
            }
          } else {
            const { success: saveSuccess, error: saveError } =
              await saveChatResponse({
                content,
                chatId,
                userId,
                metadata: {
                  totalTokens: event.totalUsage.totalTokens,
                },
              })

            if (!saveSuccess) {
              console.error('Failed to save chat response:', saveError)
            }
          }

          await updateChatTitle(chatId, [
            ...finalMessages,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              parts: content as UIMessage['parts'],
            },
          ])
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
