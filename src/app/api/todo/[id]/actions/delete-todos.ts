import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

export async function actionDeleteTodos(id: string) {
  try {
    const session = await auth()

    await prisma.todo.delete({
      where: {
        id,
        userId: session!.user.id,
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
