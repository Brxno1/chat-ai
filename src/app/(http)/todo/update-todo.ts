'use server'

import { Todo } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

export async function updateTodoAction(todo: Todo) {
  await prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      title: todo.title,
    },
  })
}
