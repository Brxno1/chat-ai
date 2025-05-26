import { NextResponse } from 'next/server'

import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const chats = await prisma.chat.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
        take: 1,
      },
    },
  })

  return NextResponse.json({ chats })
}

export async function DELETE() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  await prisma.chat.deleteMany({
    where: {
      userId: session.user.id,
    },
  })

  return NextResponse.json({ success: true })
}
