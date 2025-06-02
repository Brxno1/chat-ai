import { DeleteChatWithIdResponse } from '@/app/api/chats/[chatId]/route'
import { api } from '@/lib/axios'

export async function deleteChatWithId(id: string) {
  const response = await api.delete<DeleteChatWithIdResponse>(`/chats/${id}`)

  return response.data
}
