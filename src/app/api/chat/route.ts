import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { defaultErrorMessage } from './config'
import { logChatError } from './logger'
import { processChatAndSaveMessages } from './services/chat-processor'
import { errorHandler } from './utils/error-handler'

const ToolInvocation = z.object({
  toolCallId: z.string().optional(),
  step: z.number().optional(),
  toolName: z.string().optional(),
  args: z.record(z.any()).optional(),
  state: z.enum(['call', 'result']).optional(),
  callTimestamp: z.number().optional(),
  resultTimestamp: z.number().optional(),
  result: z.any().optional(),
})

const UserPartSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
})

const AssistantPartSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
  z.object({
    type: z.literal('reasoning'),
    reasoning: z.string(),
    details: z.array(
      z.object({
        type: z.literal('text'),
        text: z.string(),
      }),
    ),
  }),
  z.object({
    type: z.literal('tool-invocation'),
    ...ToolInvocation.shape,
  }),
])

const MessageSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('user'),
    id: z.string().optional(),
    content: z.string(),
    parts: z.array(UserPartSchema),
  }),
  z.object({
    role: z.literal('assistant'),
    id: z.string().optional(),
    content: z.string(),
    parts: z.array(AssistantPartSchema).optional(),
  }),
])

const bodySchema = z.object({
  messages: z.array(MessageSchema),
})

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
