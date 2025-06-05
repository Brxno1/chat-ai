'use server'

import { prisma } from '@/services/database/prisma'

import { getUserSession } from '../../user/profile/actions/get-user-session'

export async function getTodosAction() {
  const { session } = await getUserSession()

  if (!session) {
    return []
  }

  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return todos
  } catch (error) {
    console.error('Error fetching todos:', error)
    return []
  }
}
