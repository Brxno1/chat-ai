import { prisma } from '@/services/database/prisma'

export async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!users) {
    return { error: 'No users found', users: null, message: 'No users found' }
  }

  return {
    users,
    message: null,
    error: null,
  }
}
