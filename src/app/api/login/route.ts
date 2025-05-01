import { NextRequest, NextResponse } from 'next/server'

import { createUserAndSendMagicLink } from '@/app/api/login/actions/login'
import { createAccountSchema } from '@/schemas'
// import { uploadAndDeleteFile } from '@/lib/upload-and-remove'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const { data, error: schemaError } = createAccountSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    avatar: formData.get('avatar'),
  })

  console.log(data, 'data in POST')

  if (schemaError) {
    return NextResponse.json({ error: schemaError.message }, { status: 400 })
  }

  const { user, error, userExists } = await createUserAndSendMagicLink({
    name: data.name,
    email: data.email,
    avatar: data.avatar,
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
