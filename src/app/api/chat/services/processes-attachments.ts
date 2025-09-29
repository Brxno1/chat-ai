import { type Message } from 'ai'

import { uploadChatImage } from './upload-chat-image'

type ProcessedAttachment = {
  url: string
  name: string
  contentType: string
}

export async function processAttachments(
  lastMessage: Message,
  userId: string,
  chatId: string,
): Promise<{ processedAttachments: ProcessedAttachment[] }> {
  const { role, experimental_attachments: userAttachments } = lastMessage

  if (role !== 'user' || !userAttachments) {
    return { processedAttachments: [] }
  }

  const attachments = userAttachments.filter((attachment) => !!attachment)

  if (attachments.length === 0) {
    return { processedAttachments: [] }
  }

  const processedAttachments: ProcessedAttachment[] = []

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

      const result = await uploadChatImage(userId, chatId, {
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

  return { processedAttachments }
}
