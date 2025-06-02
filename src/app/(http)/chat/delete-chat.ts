import { DeleteChatResponse } from '@/app/api/chats/route'
import { api } from '@/lib/axios'

export async function deleteChatWithId(id: string) {
  const response = await api.delete<DeleteChatResponse>(`/chats/${id}`)

  return response.data
}
