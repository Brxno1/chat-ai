import { api } from '@/lib/axios'
import { Todo } from '@/services/database/generated'

type CreateTodoProps = {
  title: string
}

type CreateTodoResponse = {
  todo: Todo
}

export async function createTodo({
  title,
}: CreateTodoProps): Promise<CreateTodoResponse> {
  const { data } = await api.post<CreateTodoResponse>('/todo', { title })

  return data
}
