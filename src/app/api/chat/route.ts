import { type UIMessage } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

import { getUserSession } from '@/actions/user/profile/get-user-session'

import { defaultErrorMessage } from './config'
import { logChatError } from './logger'
import { processChatAndSaveMessages } from './services/chat-processor'
import { errorHandler } from './utils/error-handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { messages }: { messages: UIMessage[] } = body

    const { session } = await getUserSession()

    const userId = session?.user?.id || undefined
    const userName = session?.user?.name || undefined

    const headerChatId = req.headers.get('x-chat-id') || undefined
    const headerGhostMode = req.headers.get('x-ghost-mode') === 'true'
    const headerAiModelId = req.headers.get('x-ai-model')
    const headerRegenerateResponseId =
      req.headers.get('x-regenerate-id') || undefined

    const {
      stream: processedStream,
      headerChatId: processedChatId,
      error,
    } = await processChatAndSaveMessages({
      messages,
      userName,
      userId,
      headerChatId,
      isGhostChatMode: headerGhostMode,
      modelId: headerAiModelId!,
      regenerateResponseId: headerRegenerateResponseId,
    })

    if (error || !processedStream) {
      return NextResponse.json(
        {
          error: 'Chat processing failed',
          message: defaultErrorMessage,
        },
        { status: 500 },
      )
    }

    const response = processedStream.toUIMessageStreamResponse({
      onError: errorHandler,
      sendReasoning: true,
      sendStart: true,
      messageMetadata: ({ part }) => {
        if (part.type === 'start') {
          return {
            createdAt: Date.now(),
            model: headerAiModelId,
          }
        }
        if (part.type === 'finish') {
          const { totalUsage, finishReason } = part
          return {
            totalTokens: totalUsage.totalTokens,
            finishReason,
          }
        }
      },
      headers: {
        'x-chat-id': processedChatId ?? '',
        'x-ghost-mode': headerGhostMode.toString(),
        'x-ai-model': headerAiModelId!,
      },
    })

    response.headers.set(
      'Set-Cookie',
      `ai-model=${headerAiModelId}; Path=/; SameSite=none; HttpOnly; Secure; Max-Age=604800`, // 7 days
    )

    return response
  } catch (error) {
    logChatError(error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: defaultErrorMessage,
      },
      { status: 500 },
    )
  }
}
