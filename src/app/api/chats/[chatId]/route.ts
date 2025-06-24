import { NextRequest, NextResponse } from 'next/server'

import { deleteChatById } from '@/app/api/chat/actions/delete-chat-by-id'
import { getChatById } from '@/app/api/chat/actions/get-chat-by-id'
import { getUserSession } from '@/app/api/user/profile/actions/get-user-session'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { session } = await getUserSession()
  const { chatId } = await params

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { chat, error, success } = await getChatById(chatId, session.user.id)

  if (!success || !chat) {
    return NextResponse.json(
      { error: error || 'Chat not found' },
      { status: 404 },
    )
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
  const { chatId } = await params

  if (!session?.user?.id) {
    return NextResponse.json<DeleteChatByIdResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  const { success, error } = await deleteChatById(chatId, session.user.id)

  if (!success) {
    return NextResponse.json<DeleteChatByIdResponse>(
      { success: false, error: error || 'Failed to delete chat' },
      { status: error === 'Chat not found' ? 404 : 500 },
    )
  }

  return NextResponse.json<DeleteChatByIdResponse>({
    success: true,
  })
}
