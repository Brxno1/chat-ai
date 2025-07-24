'use server'

import sharp from 'sharp'

import { supabase } from '@/lib/supabase'

interface Attachment {
  name: string
  contentType: string
  url: string
}

export async function uploadChatImage(
  userId: string,
  chatId: string,
  attachment: Attachment,
): Promise<string | null> {
  try {
    if (!attachment.url.startsWith('data:')) {
      return null
    }

    const parts = attachment.url.split(';base64,')
    const base64Data = parts[1]
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const timestamp = new Date().getTime()
    const originalExtension = attachment.name
      .substring(attachment.name.lastIndexOf('.'))
      .toLowerCase()

    const isGif =
      originalExtension === '.gif' || attachment.contentType === 'image/gif'
    const contentType = isGif ? 'image/gif' : 'image/webp'
    const fileExtension = isGif ? '.gif' : '.webp'
    const path = `chats/${chatId}/users/${userId}/${timestamp}-${attachment.name}${fileExtension}`

    const processedImageBuffer = isGif
      ? imageBuffer
      : await sharp(imageBuffer).webp({ quality: 80 }).toBuffer()

    const { error } = await supabase.storage
      .from('chat-attachments')
      .upload(path, processedImageBuffer, {
        contentType,
      })

    if (error) {
      throw new Error(`Error uploading chat image: ${error.message}`)
    }

    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error processing chat image:', error)
    throw error
  }
}
