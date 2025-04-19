import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { updateProfile } from './actions/update-profile'

const MAX_SIZE = 10 * 1024 * 1024

const schema = z.object({
  name: z
    .string()
    .nonempty('O nome não pode estar vazio')
    .min(3, 'Nome deve ter no mínimo 3 carácteres'),
  bio: z.string().max(180, 'Biografia deve ter no máximo 180 carácteres'),
  avatar: z
    .union([
      z
        .instanceof(File, { message: 'Por favor, selecione um arquivo válido' })
        .refine(
          (file) => file.size <= MAX_SIZE,
          `O avatar deve ter no máximo 10MB`,
        ),
      z.null(),
    ])
    .optional(),
  background: z
    .union([
      z
        .instanceof(File, { message: 'Por favor, selecione um arquivo válido' })
        .refine(
          (file) => file.size <= MAX_SIZE,
          `O fundo deve ter no máximo 10MB`,
        ),
      z.null(),
    ])
    .optional(),
})

export async function PUT(req: NextRequest) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const bio = formData.get('bio') as string
  const avatar = formData.get('avatar') as File | null
  const background = formData.get('background') as File | null

  const parsedData = schema.safeParse({ name, bio, avatar, background })

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
