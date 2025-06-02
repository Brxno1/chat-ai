import { NextResponse } from 'next/server'

import { prisma } from '@/services/database/prisma'

import { getUserSession } from '../user/profile/actions/get-user-session'

export async function GET() {
  const { session } = await getUserSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const chats = await prisma.chat.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
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

export type DeleteChatResponse = {
  success: boolean
  error?: string
}

export async function DELETE(): Promise<NextResponse<DeleteChatResponse>> {
  const { session } = await getUserSession()

  if (!session?.user?.id) {
    return NextResponse.json<DeleteChatResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  await prisma.chat.deleteMany({
    where: {
      userId: session.user.id,
    },
  })

  return NextResponse.json<DeleteChatResponse>({ success: true })
}
