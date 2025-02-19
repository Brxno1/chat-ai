import { api } from '@/lib/axios'

export async function getTodos() {
  const response = await api.get('/todo')

  return response.data
}
