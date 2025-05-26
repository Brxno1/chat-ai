'use server'

import { supabase } from '@/lib/supabase'
import { processImage } from '@/utils/process-image'

export async function uploadImage(
  file: File,
  userId: string,
  type: 'avatar' | 'background',
): Promise<string | null> {
  try {
    const timestamp = new Date().getTime()
    const originalExtension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase()

    const isGif = originalExtension === '.gif'
    const contentType = isGif ? 'image/gif' : 'image/webp'
    const fileExtension = isGif ? '.gif' : '.webp'
    const path = `users/${userId}/${type}/${timestamp}${fileExtension}`

    const processedImageBuffer = await processImage(file, isGif)

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, processedImageBuffer, {
        contentType,
      })

    if (error) {
      throw new Error(`Error uploading ${type}: ${error.message}`)
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    return urlData.publicUrl
  } catch (error) {
    console.error(`Error processing ${type}:`, error)
    throw error
  }
}
