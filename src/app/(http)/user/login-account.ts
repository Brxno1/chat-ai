import { AxiosResponse } from 'axios'

import { api } from '@/lib/axios'
import type { User } from '@/types/auth'

type FormValues = {
  name: string
  email: string
  avatar: File | null
}

export async function createAccount(data: FormData) {
  const response = await api.post<FormValues, AxiosResponse<User>>(
    '/user/login',
    data,
  )

  return response.data
}
