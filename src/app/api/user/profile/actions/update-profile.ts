'use server'

import { Session } from 'next-auth'

import { supabase } from '@/lib/supabase'
import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

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

      const extension = data.avatar.name.substring(
        data.avatar.name.lastIndexOf('.'),
      )
      const avatarPath = `users/${user.id}/avatar/${timestamp}${extension}`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(avatarPath, data.avatar, {
          contentType: data.avatar.type || 'image/png',
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
      const extension = data.background.name.substring(
        data.background.name.lastIndexOf('.'),
      )

      const backgroundPath = `users/${user.id}/background/${timestamp}${extension}`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(backgroundPath, data.background, {
          contentType: data.background.type || 'image/png',
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
    return {
      error: new Error('Internal Server Error'),
      user,
    }
  }
}
