import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { loginWithMagicLink } from '@/app/api/login/actions/login'

// import { uploadAndDeleteFile } from '@/lib/upload-and-remove'

const schema = z.object({
  email: z.string().email(),
  name: z.string(),
  file: z
    .union([
      z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024),
      z.null(),
    ])
    .optional(),
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const file = formData.get('file') as File | null

  console.log(email)

  const parsedData = schema.safeParse({ name, email, file })

  if (parsedData.error) {
    return NextResponse.json({ error: parsedData.error }, { status: 400 })
  }

  const { user, error, userExists } = await loginWithMagicLink({
    name,
    email,
    file,
  })

  if (userExists) {
    return NextResponse.json({ error }, { status: 400 })
  }

  // await uploadAndDeleteFile({ file, timer: 180000 }) // 3 minutes in milliseconds

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json(user, { status: 200 })
}
