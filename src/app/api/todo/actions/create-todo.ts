import { Todo } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

type TodoData = {
  title: string
  id: string
}

type CreateTodoResponse = {
  todo: Todo | null
  error: string | null
  message: string | null
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
        error: 'Todo not created',
        message: 'Todo not created',
      }
    }

    return {
      todo,
      error: null,
      message: 'Todo created successfully',
    }
  } catch (error) {
    return {
      todo: null,
      error: 'Internal server error',
      message: 'Internal server error',
    }
  }
}
