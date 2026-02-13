import { type UIMessage } from 'ai'

import { uploadChatImage } from './upload-chat-image'

type ProcessedAttachment = {
  url: string
  name: string
  contentType: string
}

type FilePart = {
  type: 'file'
  url: string
  mediaType: string
  filename?: string
}

export async function processAttachments(
  lastMessage: UIMessage,
  userId: string,
  chatId: string,
): Promise<{ processedAttachments: ProcessedAttachment[] }> {
  const { role, parts } = lastMessage

  if (role !== 'user') {
    return { processedAttachments: [] }
  }

  const fileParts = parts.filter(
    (part): part is FilePart => part.type === 'file',
  )

  if (fileParts.length === 0) {
    return { processedAttachments: [] }
  }

  const processedAttachments: ProcessedAttachment[] = []

  for await (const attach of fileParts) {
    try {
      const isAudio = attach.mediaType?.startsWith('audio/')

      if (isAudio) {
        processedAttachments.push({
          url: attach.url,
          name: attach.filename || `audio-${new Date().getTime()}.webm`,
          contentType: attach.mediaType || 'audio/webm',
        })
        continue
      }

      const result = await uploadChatImage(userId, chatId, {
        name: attach.filename || new Date().getTime().toString(),
        contentType: attach.mediaType || 'image/webp',
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
