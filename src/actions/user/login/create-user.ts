'use server'

import type { User } from '@/services/database/generated/client'
import { prisma } from '@/services/database/prisma'

import { getUserByEmail } from './get-user-by-email'

type LoginData = {
  name: string
  email: string
}

type LoginResponse = {
  user?: User | null
  error: string | null
  userExists?: boolean
}

export async function createUser(data: LoginData): Promise<LoginResponse> {
  try {
    const { user } = await getUserByEmail({ email: data.email })

    if (user) {
      return { error: null, userExists: true }
    }

    const createdUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
      },
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
