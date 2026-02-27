'use server'

import sharp from 'sharp'

import { type ChatAttachment } from '@/types/chat'
import { supabase } from '@/lib/supabase'
import {
  generateAttachmentName,
  getAttachmentConfig,
} from '../utils/attachment-name'

export async function uploadChatAttachment(
  userId: string,
  chatId: string,
  attachment: ChatAttachment,
): Promise<{
  url: string
  name: string
  contentType: string
} | null> {
  try {
    if (!attachment.url.startsWith('data:')) {
      return null
    }

    const [, base64Data] = attachment.url.split(';base64,')
    const fileBuffer = Buffer.from(base64Data, 'base64')

    const config = getAttachmentConfig(attachment.contentType)
    const filename = generateAttachmentName(config.type)
    const path = `chats/${chatId}/users/${userId}/${filename}`

    const processedBuffer = config.processBuffer
      ? await sharp(fileBuffer).webp({ quality: 80 }).toBuffer()
      : fileBuffer

    const { error } = await supabase.storage
      .from('chat-attachments')
      .upload(path, processedBuffer, { contentType: config.contentType })

    if (error) {
      throw new Error(`Error uploading chat attachment: ${error.message}`)
    }

    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(path)

    return {
      url: urlData.publicUrl,
      name: filename,
      contentType: config.contentType,
    }
  } catch (error) {
    console.error('Error processing chat attachment:', error)
    throw error
  }
}
