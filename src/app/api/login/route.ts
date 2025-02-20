import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { loginWithMagicLink } from '@/app/api/login/actions/login'

import { getUsers } from './actions/users'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email } = schema.parse(body)

  const response = await loginWithMagicLink({ name, email })

  if (response.error) {
    return NextResponse.json({ error: response.error }, { status: 500 })
  }

  return NextResponse.json(response.user, { status: 200 })
}

export async function GET() {
  const response = await getUsers()

  if (response.error) {
    return NextResponse.json({ error: response.error }, { status: 404 })
  }

  return NextResponse.json({ users: response.users }, { status: 200 })
}
