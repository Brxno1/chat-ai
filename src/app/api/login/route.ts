import { NextRequest, NextResponse } from 'next/server'

import { loginWithMagicLink } from '@/app/api/login/actions/login'
import { accountSchema } from '@/schemas'
// import { uploadAndDeleteFile } from '@/lib/upload-and-remove'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const avatar = formData.get('avatar') as File | null

  console.log(email)

  const parsedData = accountSchema.safeParse({ name, email, avatar })

  if (parsedData.error) {
    return NextResponse.json({ error: parsedData.error }, { status: 400 })
  }

  const { user, error, userExists } = await loginWithMagicLink({
    name,
    email,
    avatar,
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
