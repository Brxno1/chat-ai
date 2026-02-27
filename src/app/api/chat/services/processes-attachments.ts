import { type UIMessage } from 'ai'

import { type FilePart, type ProcessedAttachment } from '@/types/chat'

import { uploadChatAttachment } from './upload-chat-attachment'

export async function processAttachments(
  messages: UIMessage[],
  userId: string,
  chatId: string,
): Promise<{ processedAttachments: ProcessedAttachment[] }> {
  const fileParts = messages
    .filter((message) => message.role === 'user')
    .flatMap((message) => message.parts)
    .filter((part): part is FilePart => part.type === 'file')

  if (fileParts.length === 0) {
    return { processedAttachments: [] }
  }

  const processedAttachments: ProcessedAttachment[] = []

  for await (const attach of fileParts) {
    try {
      const result = await uploadChatAttachment(userId, chatId, {
        name: attach.filename ?? '',
        contentType: attach.mediaType ?? 'image/webp',
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
