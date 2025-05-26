import { User } from 'next-auth'

import { api } from '@/lib/axios'

type UserResponse = User

export async function updateProfile(data: FormData) {
  const response = await api.put<{ user: UserResponse }>('/user/profile', data)

  return response.data.user
}
