'use server'

import { User } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

interface GetUserByEmailResponse {
  success: boolean
  error: string | null
  user: User | null
}

interface UserWithEmail {
  email: string
}

export async function getUserByEmail({
  email,
}: UserWithEmail): Promise<GetUserByEmailResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials or account does not exist',
        user: null,
      }
    }

    return {
      success: true,
      user,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to process request',
      user: null,
    }
  }
}
