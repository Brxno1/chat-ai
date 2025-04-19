'use server'

import { User } from '@prisma/client'

import { supabase } from '@/lib/supabase'
import { signIn } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

import { getUserByEmail } from './get-user-by-email'

type LoginData = {
  name: string
  email: string
  avatar?: File | null
}

type LoginResponse = {
  error: Error | null
  user?: User | null
  userExists?: boolean
}

export async function loginWithMagicLink(
  data: LoginData,
): Promise<LoginResponse> {
  try {
    const userExists = await getUserByEmail({ email: data.email })

    if (userExists.user) {
      return { error: null, userExists: true }
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        image: null,
      },
    })

    if (data.avatar && data.avatar.size > 0) {
      const userId = user.id
      const timestamp = new Date().getTime()

      const extension = data.avatar.name.substring(
        data.avatar.name.lastIndexOf('.'),
      )
      const filePath = `users/${userId}/avatar/${timestamp}${extension}`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, data.avatar, {
          contentType: data.avatar.type || 'image/png',
        })

      if (error) {
        console.error('Erro ao fazer upload:', error.message)
        return { error: new Error(error.message) }
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await prisma.user.update({
        where: { id: user.id },
        data: { image: urlData.publicUrl },
      })
    }

    await signIn('email', {
      email: user.email,
      redirect: false,
      redirectTo: '/app',
    })

    return {
      user,
      error: null,
    }
  } catch (error) {
    return {
      error: new Error('Internal Server Error'),
    }
  }
}
