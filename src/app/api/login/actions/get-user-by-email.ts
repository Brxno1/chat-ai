'use server'

import { User } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

interface GetUserByEmailResponse {
  error: Error | null
  message: string | null
  user: User | null
}

interface UserWithEmail {
  email: string
}

export async function getUserByEmail({
  email,
}: UserWithEmail): Promise<GetUserByEmailResponse> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return {
      error: new Error('User not found'),
      user: null,
      message: null,
    }
  }

  return {
    user,
    message: null,
    error: null,
  }
}
