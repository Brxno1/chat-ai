import { Todo } from '@prisma/client'

import { api } from '@/lib/axios'

export async function getTodos({ id }: { id: string }) {
  const response = await api.get<Todo[]>(`/todo`, {
    headers: {
      'X-user-ID': id,
    },
  })

  return response.data
}
