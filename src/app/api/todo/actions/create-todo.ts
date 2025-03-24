import { Todo } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

type TodoData = {
  title: string
  id: string
}

type CreateTodoResponse = {
  todo: Todo | null
  error: Error | null
}

export async function actionCreateTodo({
  title,
  id,
}: TodoData): Promise<CreateTodoResponse> {
  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        user: {
          connect: { id },
        },
      },
    })

    if (!todo) {
      return {
        todo: null,
        error: new Error('Todo not created'),
      }
    }

    return {
      todo,
      error: null,
    }
  } catch (error) {
    return {
      todo: null,
      error: new Error('Internal server error'),
    }
  }
}
