'use server'

import { User } from '@prisma/client'

import { supabase } from '@/lib/supabase'
import { signIn } from '@/services/auth'
import { prisma } from '@/services/database/prisma'
import { processImage } from '@/utils/process-image'

import { getUserByEmail } from './get-user-by-email'

type LoginData = {
  name: string
  email: string
  avatar?: File | null
}

type LoginResponse = {
  user?: User | null
  error: string | null
  userExists?: boolean
}

export async function createUserAndSendMagicLink(
  data: LoginData,
): Promise<LoginResponse> {
  try {
    const { user } = await getUserByEmail({ email: data.email })

    if (user) {
      return { error: null, userExists: true }
    }

    const createdUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        image: null,
      },
    })

    if (data.avatar) {
      const timestamp = new Date().getTime()
      const originalExtension = data.avatar.name
        .substring(data.avatar.name.lastIndexOf('.'))
        .toLowerCase()

      const isGif = originalExtension === '.gif'
      const contentType = isGif ? 'image/gif' : 'image/webp'

      const fileExtension = isGif ? '.gif' : '.webp'
      const avatarPath = `users/${createdUser.id}/avatar/${timestamp}${fileExtension}`

      const processedImageBuffer = await processImage(data.avatar, isGif)

      const { error } = await supabase.storage
        .from('avatars')
        .upload(avatarPath, processedImageBuffer, {
          contentType,
        })

      if (error) {
        return { error: error.message }
      }

      const { data: get } = supabase.storage
        .from('avatars')
        .getPublicUrl(avatarPath)

      await prisma.user.update({
        where: { id: createdUser.id },
        data: { image: get.publicUrl },
      })
    }

    await signIn('email', {
      email: createdUser.email,
      redirect: false,
      redirectTo: '/chat',
    })

    return {
      user: createdUser,
      error: null,
    }
  } catch (error) {
    return {
      error: String(error),
    }
  }
}
