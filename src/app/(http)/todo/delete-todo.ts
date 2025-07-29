import { api } from '@/lib/axios'

export async function deleteTodo(id: string) {
  const response = await api.delete<{ message: string }>(`/todo/${id}`)

  return response.data
}
