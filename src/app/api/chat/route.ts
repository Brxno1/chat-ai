import { NextRequest, NextResponse } from 'next/server'

import { defaultErrorMessage } from './config'
import { logChatError } from './logger'
import { processChatAndSaveMessages } from './services/chat-processor'
import { errorHandler } from './utils/error-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { messages } = body

    const processedMessages = messages.map((message) => {
      if (
        message.role === 'assistant' &&
        message.content.trim() === '' &&
        message.parts?.some((part) => part.type === 'tool-invocation')
      ) {
        return {
          ...message,
          content: 'Informações sendo solicitadas via ferramentas...',
          parts: message.parts.filter(
            (part) =>
              part.type !== 'tool-invocation' || Object.keys(part).length > 1,
          ),
        }
      }
      return message
    })

    const headerUserName = req.headers.get('x-user-name') || undefined
    const headerUserId = req.headers.get('x-user-id') || undefined
    const headerChatId = req.headers.get('x-chat-id') || undefined
    const headerGhostMode = req.headers.get('x-ghost-mode') === 'true'
    const headerAiModelId = req.headers.get('x-ai-model-id')

    const {
      stream: processedStream,
      headerChatId: processedChatId,
      error,
    } = await processChatAndSaveMessages({
      messages: processedMessages,
      userName: headerUserName,
      userId: headerUserId,
      headerChatId,
      isGhostChatMode: headerGhostMode,
      modelId: headerAiModelId!,
    })

    if (error || !processedStream) {
      return NextResponse.json(
        {
          error: 'Chat processing failed',
          message: error || defaultErrorMessage,
        },
        { status: 500 },
      )
    }

    const response = processedStream.toDataStreamResponse({
      getErrorMessage: errorHandler,
      sendReasoning: true,
      sendUsage: true,
      headers: {
        'x-chat-id': processedChatId ?? '',
        'x-user-id': headerUserId ?? '',
        'x-user-name': headerUserName ?? 'Guest',
        'x-ghost-mode': headerGhostMode.toString(),
        'x-message-count': (body.messages.length + 1).toString(),
        'x-context-length': body.messages.slice(-4).length.toString(),
        'x-user-tier': headerUserId ? 'premium' : 'free',
        'x-ai-model-id': headerAiModelId!,
      },
    })

    response.headers.set(
      'Set-Cookie',
      `ai-model-id=${headerAiModelId}; Path=/; SameSite=none; HttpOnly; Secure; Max-Age=604800`, // 7 days
    )

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
