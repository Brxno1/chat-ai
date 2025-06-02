import { Chat } from '@prisma/client'
import { NextResponse } from 'next/server'

import { prisma } from '@/services/database/prisma'

import { getUserSession } from '../user/profile/actions/get-user-session'

export type ChatResponse = {
  chats: Chat[] | null
  error?: string
}

export async function GET(): Promise<NextResponse<ChatResponse>> {
  const { session } = await getUserSession()

  if (!session?.user?.id) {
    return NextResponse.json<ChatResponse>(
      { chats: null, error: 'User not found' },
      { status: 401 },
    )
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

  if (!chats) {
    return NextResponse.json<ChatResponse>(
      { chats: null, error: 'Chats not found' },
      { status: 404 },
    )
  }

  return NextResponse.json<ChatResponse>({ chats })
}
