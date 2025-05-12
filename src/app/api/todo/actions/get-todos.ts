'use server'

import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

export async function actionGetTodos() {
  const session = await auth()

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
