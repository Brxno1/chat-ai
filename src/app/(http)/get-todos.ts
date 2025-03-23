import { Todo } from '@prisma/client'

import { api } from '@/lib/axios'

export async function getTodos({ id }: { id: string }) {
  const response = await api.get<Todo[]>(`/todo/${id}`)

  return response.data
}
