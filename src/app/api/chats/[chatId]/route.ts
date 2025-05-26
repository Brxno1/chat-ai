import { NextResponse } from 'next/server'

import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } },
) {
  const session = await auth()
  const { chatId } = params

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!chat) {
    return NextResponse.json({ error: 'Chat não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ chat })
}

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } },
) {
  const session = await auth()
  const { chatId } = params

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  })

  if (!chat) {
    return NextResponse.json({ error: 'Chat não encontrado' }, { status: 404 })
  }

  await prisma.chat.delete({
    where: {
      id: chatId,
    },
  })

  return NextResponse.json({ success: true })
}
