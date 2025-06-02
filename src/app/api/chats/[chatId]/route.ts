import { NextResponse } from 'next/server'

import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { prisma } from '@/services/database/prisma'

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } },
) {
  const { session } = await getUserSession()
  const { chatId } = params

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  return NextResponse.json({ chat })
}

export type DeleteChatWithIdResponse = {
  success: boolean
  error?: string
}

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } },
) {
  const { session } = await getUserSession()
  const { chatId } = params

  if (!session?.user?.id) {
    return NextResponse.json<DeleteChatWithIdResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  })

  if (!chat) {
    return NextResponse.json<DeleteChatWithIdResponse>(
      { success: false, error: 'Chat not found' },
      { status: 404 },
    )
  }

  await prisma.chat.delete({
    where: {
      id: chatId,
    },
  })

  return NextResponse.json<DeleteChatWithIdResponse>({
    success: true,
  })
}
