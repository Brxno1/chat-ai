'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/services/database/prisma'

type MarkTodoAsDoneActionProps = {
  id: string
  userId: string
}

export async function markTodoAsDoneAction({
  id,
  userId,
}: MarkTodoAsDoneActionProps) {
  try {
    const updatedTodo = await prisma.todo.update({
      where: {
        id,
        userId,
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
