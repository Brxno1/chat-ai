'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/services/database/prisma'

type CancelTodoActionProps = {
  id: string
  userId: string
}

export async function cancelTodoAction({ id, userId }: CancelTodoActionProps) {
  try {
    const updatedTodo = await prisma.todo.update({
      where: {
        id,
        userId,
      },
      data: {
        status: 'CANCELLED',
        completed: false,
        cancelledAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    return { success: true, todo: updatedTodo }
  } catch (error) {
    console.error('Error cancelling todo:', error)
    return { success: false, error: 'Failed to cancel todo' }
  }
}
