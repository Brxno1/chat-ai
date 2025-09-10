import { NextRequest, NextResponse } from 'next/server'

import { createUserAndSendMagicLink } from '@/actions/user/login/create-user-and-send-magic-link'
import { createAccountSchema } from '@/schemas'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const { data, error: schemaError } = createAccountSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    avatar: formData.get('avatar'),
  })

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

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json(user, { status: 200 })
}
