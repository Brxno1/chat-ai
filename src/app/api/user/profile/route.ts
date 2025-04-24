import { NextRequest, NextResponse } from 'next/server'

import { editProfileSchema } from '@/schemas'

import { updateProfile } from './actions/update-profile'
export async function PUT(req: NextRequest) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const bio = formData.get('bio') as string
  const avatar = formData.get('avatar') as File | null
  const background = formData.get('background') as File | null

  const parsedData = editProfileSchema.safeParse({
    name,
    bio,
    avatar,
    background,
  })

  if (parsedData.error) {
    return NextResponse.json({ error: parsedData.error }, { status: 400 })
  }

  const { error, user } = await updateProfile({
    name,
    bio,
    avatar,
    background,
  })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ user }, { status: 200 })
}
