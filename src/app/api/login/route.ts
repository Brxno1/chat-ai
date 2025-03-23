import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { loginWithMagicLink } from '@/app/api/login/actions/login'
import { uploadAndDeleteFile } from '@/lib/upload-and-remove'

import { getUserByEmail } from './actions/get-user-by-email'

const schema = z.object({
  email: z.string().email(),
  name: z.string(),
  file: z
    .union([
      z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024),
      z.undefined(),
    ])
    .optional(),
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const file = (formData.get('file') as File | null) ?? undefined

  const parsedData = schema.safeParse({ name, email, file })

  if (parsedData.error) {
    return NextResponse.json({ error: parsedData.error }, { status: 400 })
  }

  const response = await loginWithMagicLink({ name, email, file })

  await uploadAndDeleteFile({ file, timer: 180000 }) // 3 minutes in milliseconds

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

  const { user, error } = await getUserByEmail({ email })

  if (error) {
    return NextResponse.json({ error }, { status: 404 })
  }

  return NextResponse.json({ user }, { status: 200 })
}
