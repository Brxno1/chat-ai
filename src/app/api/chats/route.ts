import { NextResponse } from 'next/server'

import {
  ChatWithMessages,
  getChatsAction,
} from '@/app/api/chat/actions/get-chats'

export type FetchChatResponse = {
  chats: ChatWithMessages[] | null
  error?: string
}

export async function GET(): Promise<NextResponse<FetchChatResponse>> {
  try {
    const { chats, error, unauthorized } = await getChatsAction()

    if (unauthorized) {
      return NextResponse.json<FetchChatResponse>(
        { chats: null, error: 'Unauthorized' },
        { status: 401 },
      )
    }

    if (error && !unauthorized) {
      return NextResponse.json<FetchChatResponse>(
        { chats: null, error },
        { status: 500 },
      )
    }

    if (!chats || chats.length === 0) {
      return NextResponse.json<FetchChatResponse>(
        { chats: null, error: 'Chats not found' },
        { status: 404 },
      )
    }

    return NextResponse.json<FetchChatResponse>({ chats })
  } catch (error) {
    return NextResponse.json<FetchChatResponse>(
      { chats: null, error: 'Error fetching chats' },
      { status: 500 },
    )
  }
}
