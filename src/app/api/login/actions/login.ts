'use server'

import { User } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

type LoginData = {
  name: string
  email: string
}

type LoginResponse = {
  error: string | null
  message: string | null
  user: User | null
}

export async function loginWithMagicLink(
  data: LoginData,
): Promise<LoginResponse> {
  try {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (userExists) {
      return { error: 'User already exists', message: null, user: null }
    }

    const createdUser = await prisma.user.create({ data })

    return {
      message: 'User created successfully',
      user: {
        email: createdUser.email,
        name: createdUser.name,
        id: createdUser.id,
        image: createdUser.image,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
        emailVerified: createdUser.emailVerified,
      },
      error: null,
    }
  } catch (error) {
    return { error: 'Internal Server Error', message: null, user: null }
  }
}
