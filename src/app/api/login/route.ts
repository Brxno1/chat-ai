import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { loginWithMagicLink } from '@/app/api/login/actions/login'
import { uploadAndDeleteFile } from '@/lib/upload-and-remove'

import { getUserByEmail } from './actions/users'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string(),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'O arquivo deve ter no máximo 10MB',
    )
    .refine(
      (file) => file.type.startsWith('image/'),
      'O arquivo deve ser uma imagem válida',
    ),
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const file = formData.get('file') as File | null

  const parsedData = schema.safeParse({ name, email, file })

  if (parsedData.error) {
    return NextResponse.json({ error: parsedData.error }, { status: 400 })
  }

  await uploadAndDeleteFile(file, 300000) // 5 min default

  const response = await loginWithMagicLink({ name, email, file })

  if (response.error) {
    return NextResponse.json({ error: response.error }, { status: 500 })
  }

  return NextResponse.json(response.user, { status: 200 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const response = await getUserByEmail({ email })

  if (response.error) {
    return NextResponse.json({ error: response.error }, { status: 404 })
  }

  return NextResponse.json({ user: response.data }, { status: 200 })
}
