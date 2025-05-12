'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

export async function actionMarkTodoAsDone(id: string) {
  try {
    const session = await auth()

    const updatedTodo = await prisma.todo.update({
      where: {
        id,
        userId: session!.user.id,
      },
      data: {
        doneAt: new Date(),
        status: 'FINISHED',
        completed: true,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, todo: updatedTodo }
  } catch (error) {
    console.error('Error marking todo as done:', error)
    return { success: false, error: 'Failed to mark todo as completed' }
  }
}
