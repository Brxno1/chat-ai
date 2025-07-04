'use server'

import { z } from 'zod'

import { Todo } from '@/services/database/generated'
import { prisma } from '@/services/database/prisma'

const updateTodoSchema = z.object({
  userId: z.string(),
  id: z.string(),
  title: z
    .string()
    .min(5)
    .max(50)
    .nonempty()
    .refine((title) => !/^\d+$/.test(title))
    .refine((title) => title.trim() !== ''),
})

type UpdateTodoActionProps = z.infer<typeof updateTodoSchema>

type UpdateTodoActionResponse = {
  todo: Todo | null
  success: boolean
  error?: string
}

export async function updateTodoAction({
  userId,
  id,
  title,
}: UpdateTodoActionProps): Promise<UpdateTodoActionResponse> {
  try {
    const validatedData = updateTodoSchema.parse({ id, title, userId })

    const updatedTodo = await prisma.todo.update({
      where: { id: validatedData.id, userId: validatedData.userId },
      data: { title: validatedData.title },
    })

    return { success: true, todo: updatedTodo }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message, todo: null }
    }

    return { success: false, error: 'Error updating todo', todo: null }
  }
}
