'use server'

import { Todo } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

type TodoDataProps = {
  title: string
  id: string
}

type CreateTodoResponse = {
  todo: Todo | null
  error: string | null
}

export async function createTodoAction({
  title,
  id,
}: TodoDataProps): Promise<CreateTodoResponse> {
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
      }
    }

    return {
      todo,
      error: null,
    }
  } catch (error) {
    return {
      todo: null,
      error: 'Internal server error',
    }
  }
}
