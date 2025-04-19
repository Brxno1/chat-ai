import { prisma } from './services/database/prisma'

export async function updateExistingTodos() {
  const todos = await prisma.todo.findMany()

  for (const todo of todos) {
    await prisma.todo.update({
      where: { id: todo.id },
      data: {
        status: todo.doneAt ? 'FINISHED' : 'PENDING',
      },
    })
  }
}
