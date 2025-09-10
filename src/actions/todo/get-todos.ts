'use server'

import { getUserSession } from '@/actions/user/profile/get-user-session'
import { Todo } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'

type GetTodosResponse = {
  todos: Todo[]
  error?: string
  unauthorized?: boolean
}

export async function getTodosAction(): Promise<GetTodosResponse> {
  const { session, error } = await getUserSession()

  if (error || !session) {
    return {
      todos: [],
      error: 'Unauthorized',
      unauthorized: true,
    }
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

    return {
      todos,
    }
  } catch (error) {
    return {
      todos: [],
      error: 'Error fetching todos',
    }
  }
}
