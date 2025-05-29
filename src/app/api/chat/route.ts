import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/services/auth'

import { setAiModelCookie } from './actions/set-ai-model-cookie'
import { chatConfig, defaultErrorMessage } from './config'
import { logChatError } from './logger'
import { processChat } from './services/chat-processor'

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
  name: z.string().optional(),
  locale: z.string(),
  chatId: z.string().optional(),
  isGhostChatMode: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())

    const session = await auth()
    const userId = session?.user?.id

    const model = (await setAiModelCookie()) || chatConfig.modelName

    const { stream, chatId, error } = await processChat({
      ...body,
      userId,
      model,
    })

    if (error || !stream) {
      return NextResponse.json(
        {
          error: 'Chat processing failed',
          message: error || defaultErrorMessage,
        },
        { status: 500 },
      )
    }

    try {
      const response = stream.toDataStreamResponse()
      if (chatId) {
        response.headers.set('X-Chat-Id', chatId)
      }

      return response
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 },
      )
    }
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
