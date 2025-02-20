import { api } from '@/lib/axios'

export async function deleteTodo(id: string) {
  await api.delete(`/todo`, { data: { id } })
}
