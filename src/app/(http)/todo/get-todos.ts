import { api } from '@/lib/axios'
import { Todo } from '@/services/database/generated'

export async function getTodos() {
  const response = await api.get<Todo[]>(`/todo`)

  return response.data
}
