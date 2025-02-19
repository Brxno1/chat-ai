import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

export async function actionGetTodos() {
  const session = await auth()

  const todos = await prisma.todo.findMany({
    where: { userId: session?.user.id },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!todos) {
    return {
      error: 'No todos found',
      message: 'No todos found',
    }
  }

  return todos
}
