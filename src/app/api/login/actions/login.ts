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
  user?: User | null
  error: string | null
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

    const createdUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        image: null,
      },
    })

    if (data.avatar && data.avatar.size > 0) {
      const userId = createdUser.id
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
        return { error: error.message }
      }

      const { data: get } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await prisma.user.update({
        where: { id: createdUser.id },
        data: { image: get.publicUrl },
      })
    }

    await signIn('email', {
      email: createdUser.email,
      redirect: false,
      redirectTo: '/dashboard',
    })

    return {
      user: createdUser,
      error: null,
    }
  } catch (error) {
    return {
      error: 'Internal Server Error',
    }
  }
}
