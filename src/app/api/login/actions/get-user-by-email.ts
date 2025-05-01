'use server'

import { User } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

interface GetUserByEmailResponse {
  error: string | null
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
      error: 'User not found',
      user: null,
    }
  }

  return {
    user,
    error: null,
  }
}
