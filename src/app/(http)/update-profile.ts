import { api } from '@/lib/axios'

type UserResponse = {
  id: string
  name: string
  email: string
  bio: string | null
  image: string | null
  background: string | null
}

export async function updateProfile(data: FormData) {
  const response = await api.put<{ user: UserResponse }>('/user/profile', data)

  return response.data.user
}
