import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getUserSession } from '../user/profile/actions/get-user-session'
import { defaultErrorMessage } from './config'
import { logChatError } from './logger'
import { processChatAndSaveMessages } from './services/chat-processor'

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
  name: z.string().optional(),
  chatId: z.string().optional(),
  isGhostChatMode: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())

    const { session } = await getUserSession()
    const userId = session?.user?.id
    const userName = session?.user?.name

    const { stream, chatId, error } = await processChatAndSaveMessages({
      ...body,
      name: userName ?? body.name,
      userId,
    })

    if (error || !stream) {
      return NextResponse.json(
        {
          error: 'Chat processing failed',
          message: error || defaultErrorMessage,
          rateLimitReached: true,
        },
        { status: 500 },
      )
    }

    const response = stream.toDataStreamResponse({
      getErrorMessage: errorHandler,
    })

    if (chatId) response.headers.set('x-chat-id', chatId)

    return response
  } catch (error) {
    logChatError(error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        message: defaultErrorMessage,
      },
      { status: 500 },
    )
  }
}

export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return JSON.stringify(error)
}
