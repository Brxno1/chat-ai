import { NextRequest, NextResponse } from 'next/server'

import { errorHandler } from '@/app/api/chat/utils/error-handler'
import { updateProfileSchema } from '@/schemas'
import { auth } from '@/services/auth'

import { updateProfile } from './actions/update-profile'

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()

    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const avatar = formData.get('avatar') as File | null
    const background = formData.get('background') as File | null

    const parsedData = updateProfileSchema.safeParse({
      name,
      bio,
      avatar,
      background,
    })

    if (parsedData.error) {
      return NextResponse.json(
        { error: parsedData.error.format() },
        { status: 400 },
      )
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
  } catch (error) {
    return NextResponse.json({ error: errorHandler(error) }, { status: 500 })
  }
}
