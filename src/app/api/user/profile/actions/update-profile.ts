'use server'

import { Session } from 'next-auth'

import { supabase } from '@/lib/supabase'
import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'
import { processImage } from '@/utils/process-image'

type LoginData = {
  name: string
  bio: string
  avatar?: File | null
  background?: File | null
}

type EditProfileResponse = {
  user: Session['user']
  error: Error | null
}

export async function updateProfile(
  data: LoginData,
): Promise<EditProfileResponse> {
  const session = await auth()
  const { user } = session!

  try {
    let imageUrl = null
    let backgroundUrl = null

    if (data.avatar) {
      const timestamp = new Date().getTime()
      const originalExtension = data.avatar.name
        .substring(data.avatar.name.lastIndexOf('.'))
        .toLowerCase()

      const isGif = originalExtension === '.gif'
      const contentType = isGif ? 'image/gif' : 'image/webp'

      const fileExtension = isGif ? '.gif' : '.webp'
      const avatarPath = `users/${user.id}/avatar/${timestamp}${fileExtension}`

      const processedImageBuffer = await processImage(data.avatar, isGif)

      const { error } = await supabase.storage
        .from('avatars')
        .upload(avatarPath, processedImageBuffer, {
          contentType,
        })

      if (error) {
        return { error: new Error(error.message), user }
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(avatarPath)

      imageUrl = urlData.publicUrl
    }

    if (data.background) {
      const timestamp = new Date().getTime()
      const originalExtension = data.background.name
        .substring(data.background.name.lastIndexOf('.'))
        .toLowerCase()

      const isGif = originalExtension === '.gif'
      const fileExtension = isGif ? '.gif' : '.webp'
      const backgroundPath = `users/${user.id}/background/${timestamp}${fileExtension}`
      const contentType = isGif ? 'image/gif' : 'image/webp'

      const processedImageBuffer = await processImage(data.background, isGif)

      const { error } = await supabase.storage
        .from('avatars')
        .upload(backgroundPath, processedImageBuffer, {
          contentType,
        })

      if (error) {
        console.error('Erro ao fazer upload do background:', error.message)
        return { error: new Error(error.message), user }
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(backgroundPath)

      backgroundUrl = urlData.publicUrl
    }

    if (imageUrl || backgroundUrl || data.bio || data.name) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.bio && { bio: data.bio }),
          ...(imageUrl && { image: imageUrl }),
          ...(backgroundUrl && { background: backgroundUrl }),
        },
      })

      return {
        error: null,
        user: updatedUser,
      }
    }

    return {
      error: null,
      user,
    }
  } catch (error) {
    console.error('Error in updateProfile:', error)
    return {
      error: new Error('Internal Server Error'),
      user,
    }
  }
}
