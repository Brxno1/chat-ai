import { prisma } from '@/services/database/prisma'

interface UserWithEmail {
  email: string
}

export async function getUserByEmail({ email }: UserWithEmail) {
  const data = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  if (!data) {
    return { error: 'User not found', data: null, message: 'User not found' }
  }

  return {
    data,
    message: null,
    error: null,
  }
}
