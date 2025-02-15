import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/services/database/prisma'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email } = schema.parse(body)

    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (userExists) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 },
      )
    }

    await prisma.user.create({
      data: {
        name,
        email,
      },
    })
    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
