import { ChatResponse } from '@/app/api/chats/route'
import { api } from '@/lib/axios'

export async function fetchChats() {
  const response = await api.get<ChatResponse>('/chats')

  return response.data
}
