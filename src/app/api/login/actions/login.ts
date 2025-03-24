'use server'

import { User } from '@prisma/client'

import { supabase } from '@/lib/supabase'
import { signIn } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

type LoginData = {
  name: string
  email: string
  file?: File | null
}

type LoginResponse = {
  error: Error | null
  user: User | null
  userExists?: boolean
}

export async function loginWithMagicLink(
  data: LoginData,
): Promise<LoginResponse> {
  try {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (userExists) {
      return {
        error: new Error('Occurred an error'),
        user: null,
        userExists: true,
      }
    }

    let avatarUrl = null
    if (data.file && data.file.size > 0) {
      const avatarName = `${new Date().getTime()}-${data.file.name.replace(/[^a-zA-Z0-9.]/g, '-')}` // Regex para remover caracteres não-alfanuméricos

      const { error } = await supabase.storage
        .from('avatars')
        .upload(avatarName, data.file, {
          contentType: data.file.type || 'image/png',
        })

      if (error) {
        console.error('Erro ao fazer upload:', error.message)
        return { error: new Error(error.message), user: null }
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(avatarName)
      avatarUrl = urlData.publicUrl
    }

    const createdUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        image: avatarUrl || null,
      },
    })

    await signIn('email', {
      email: createdUser.email,
      redirect: false,
      redirectTo: '/app',
    })

    return {
      user: createdUser,
      error: null,
    }
  } catch (error) {
    return {
      error: new Error('Internal Server Error'),
      user: null,
    }
  }
}
