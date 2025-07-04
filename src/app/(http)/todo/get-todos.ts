import { api } from '@/lib/axios'
import { Todo } from '@/services/database/generated'

export async function getTodos({ id }: { id: string }) {
  const response = await api.get<Todo[]>(`/todo`, {
    headers: {
      'X-user-ID': id,
    },
  })

  return response.data
}
