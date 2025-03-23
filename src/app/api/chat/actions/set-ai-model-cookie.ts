'use server'

import { cookies } from 'next/headers'

export async function setAiModelCookie() {
  const cookieStore = await cookies()

  cookieStore.set('aiModel', 'gpt-4o-mini', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return cookieStore.get('aiModel')?.value
}
