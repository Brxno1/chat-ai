import { FetchChatResponse } from '@/app/api/chats/route'
import { api } from '@/lib/axios'

export async function fetchChats() {
  const response = await api.get<FetchChatResponse>('/chats')

  return response.data.chats || []
}
