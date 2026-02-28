import { api } from '@/lib/axios'
import type { User } from '@/types/auth'

type UserResponse = User

export async function updateProfile(data: FormData) {
  const response = await api.put<{ user: UserResponse }>('/user/profile', data)

  return response.data.user
}
