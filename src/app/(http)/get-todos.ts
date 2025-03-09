import { Todo } from '@prisma/client'

import { api } from '@/lib/axios'

export async function getTodos(): Promise<Todo[]> {
  const response = await api.get('/todo')

  return response.data
}
