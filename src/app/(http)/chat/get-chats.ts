import { api } from '@/lib/axios'

export async function fetchChats() {
  const response = await api.get('/chats')

  return response.data.chats
}
