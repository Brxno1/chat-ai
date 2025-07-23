import { FetchChatResponse } from '@/app/api/chats/route'
import { api } from '@/lib/axios'

export async function fetchChats() {
  const { data } = await api.get<FetchChatResponse>('/chats')

  return data.chats || []
}
