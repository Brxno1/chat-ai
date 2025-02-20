import { api } from '@/lib/axios'

type CreateTodoProps = {
  title: string
}

export async function createTodo({ title }: CreateTodoProps) {
  const response = await api.post('/todo', { title })

  return response.data
}
