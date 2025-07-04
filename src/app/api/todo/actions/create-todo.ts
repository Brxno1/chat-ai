'use server'

import { Todo } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'

type CreateTodoDataProps = {
  title: string
  userId: string
}

type CreateTodoResponse = {
  todo: Todo | null
  error?: string
}

export async function createTodoAction({
  title,
  userId,
}: CreateTodoDataProps): Promise<CreateTodoResponse> {
  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        user: {
          connect: { id: userId },
        },
      },
    })

    if (!todo) {
      return {
        todo: null,
        error: 'Error to create todo',
      }
    }

    return {
      todo,
    }
  } catch (error) {
    return {
      todo: null,
      error: 'Internal server error',
    }
  }
}
