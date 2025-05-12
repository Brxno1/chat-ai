'use server'

import { prisma } from '@/services/database/prisma'

type DeleteTodoArgs = {
  id: string
  userId: string
}

type DeleteTodosResponse = {
  message: string
  error: string | null
}

export async function actionDeleteTodos({
  id,
  userId,
}: DeleteTodoArgs): Promise<DeleteTodosResponse> {
  try {
    await prisma.todo.delete({
      where: {
        id,
        userId,
      },
    })

    return {
      message: 'Todo deleted successfully',
      error: null,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
        message: 'Error deleting todo',
      }
    }

    return {
      error: 'An unknown error occurred',
      message: 'Error deleting todo',
    }
  }
}
