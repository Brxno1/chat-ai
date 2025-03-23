import { prisma } from '@/services/database/prisma'

export async function actionGetTodos({ id }: { id: string }) {
  const todos = await prisma.todo.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (todos.length === 0) {
    return {
      error: 'No todos found',
      message: 'No todos found',
    }
  }

  return todos
}
