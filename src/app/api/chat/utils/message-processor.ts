import { type UIMessage } from 'ai'

import type { MessageRole } from '@/services/database/generated/client'
import type { StoragePart, UploadedAttachment } from '@/types/chat'

export function extractTextFromMessage(message: UIMessage): string {
  return message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join(' ')
}

export function formatMessageForStorage(
  message: UIMessage,
  uploadedAttachments?: UploadedAttachment[],
): { role: MessageRole; parts: StoragePart[] } {
  const role: MessageRole =
    message.role.toLowerCase() === 'user' ? 'USER' : 'ASSISTANT'
  const pendingAttachments = uploadedAttachments ? [...uploadedAttachments] : []

  const parts = message.parts.reduce<StoragePart[]>((acc, part) => {
    if (part.type === 'text') {
      acc.push({ type: 'text', text: part.text })
      return acc
    }

    if (part.type === 'file') {
      const attachment = pendingAttachments.shift()
      const url = attachment?.url ?? part.url

      if (url.startsWith('data:')) return acc

      acc.push({
        type: 'file',
        url,
        mediaType: attachment?.contentType ?? part.mediaType,
        filename: attachment?.name ?? part.filename,
      })
    }

    return acc
  }, [])

  return {
    role,
    parts,
  }
}
