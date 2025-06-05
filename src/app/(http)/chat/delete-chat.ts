import { DeleteChatByIdResponse } from '@/app/api/chats/[chatId]/route'
import { api } from '@/lib/axios'

export async function deleteChatById(id: string) {
  const response = await api.delete<DeleteChatByIdResponse>(`/chats/${id}`)

  return response.data
}
