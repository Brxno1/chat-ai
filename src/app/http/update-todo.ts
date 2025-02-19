import { api } from '@/lib/axios'

export async function updateTodo(title: string) {
  const response = await api.put('/todos', { title })

  return response.data
}
