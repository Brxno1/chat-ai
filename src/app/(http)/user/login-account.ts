import { AxiosResponse } from 'axios'
import { User } from 'next-auth'

import { api } from '@/lib/axios'

type FormValues = {
  name: string
  email: string
  avatar: File | null
}

export async function createAccount(data: FormData) {
  const response = await api.post<FormValues, AxiosResponse<User>>(
    '/login',
    data,
  )

  return response.data
}
