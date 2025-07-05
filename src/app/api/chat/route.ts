import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { defaultErrorMessage } from './config'
import { logChatError } from './logger'
import { processChatAndSaveMessages } from './services/chat-processor'
import { errorHandler } from './utils/error-handler'

// const schema = z.object({
//   messages: z.array(
//     z.object({
//       role: z.enum(['user', 'assistant']),
//       content: z.string(),
//     }),
//   ),
// })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages } = body

    const validatedMessages = messages.map((message) => {
      if (message.role === 'assistant' && message.content.trim() === '') {
        return {
          ...message,
          content: 'Processando sua solicitação, um momento...',
        }
      }
      return message
    })

    const headerUserName = req.headers.get('x-user-name') || undefined
    const headerUserId = req.headers.get('x-user-id') || undefined
    const headerChatId = req.headers.get('x-chat-id') || undefined
    const headerGhostMode = req.headers.get('x-ghost-mode') === 'true'

    const {
      stream: processedStream,
      chatId: processedChatId,
      error,
    } = await processChatAndSaveMessages({
      messages: validatedMessages,
      name: headerUserName,
      userId: headerUserId,
      chatId: headerChatId,
      isGhostChatMode: headerGhostMode,
    })

    if (error || !processedStream) {
      return NextResponse.json(
        {
          error: 'Chat processing failed',
          message: error || defaultErrorMessage,
          rateLimitReached: true,
        },
        { status: 500 },
      )
    }

    const response = processedStream.toDataStreamResponse({
      getErrorMessage: errorHandler,
      sendReasoning: true,
      headers: {
        'x-chat-id': processedChatId ?? '',
        'x-user-id': headerUserId ?? 'anonymous',
        'x-user-name': headerUserName ?? 'Guest',
        'x-ghost-mode': headerGhostMode.toString(),
        'x-message-count': (body.messages.length + 1).toString(),
        'x-context-length': body.messages.slice(-4).length.toString(),
        'x-user-tier': headerUserId ? 'premium' : 'free',
      },
    })

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
