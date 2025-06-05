import { NextRequest, NextResponse } from 'next/server'

import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'
import { prisma } from '@/services/database/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { session } = await getUserSession()
  const { chatId } = await params

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

export type DeleteChatByIdResponse = {
  success: boolean
  error?: string
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { session } = await getUserSession()
  const resolvedParams = await params
  const chatId = resolvedParams.chatId

  if (!session?.user?.id) {
    return NextResponse.json<DeleteChatByIdResponse>(
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
    return NextResponse.json<DeleteChatByIdResponse>(
      { success: false, error: 'Chat not found' },
      { status: 404 },
    )
  }

  await prisma.chat.delete({
    where: {
      id: chatId,
    },
  })

  return NextResponse.json<DeleteChatByIdResponse>({
    success: true,
  })
}
