import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { setAiModelCookie } from './actions/set-ai-model-cookie'
import { chatConfig, defaultErrorMessage } from './config'
import { logChatError } from './logger'
import { generateSystemPrompt } from './prompts'

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
  name: z.string(),
  locale: z.string(),
})

export const maxDuration = chatConfig.timeoutSeconds

export async function POST(req: NextRequest) {
  const { messages, name, locale } = schema.parse(await req.json())

  try {
    const model = await setAiModelCookie()

    const result = streamText({
      model: openai(model || chatConfig.modelName),
      temperature: chatConfig.temperature,
      maxTokens: chatConfig.maxTokens,
      messages: [
        {
          role: 'system',
          content: generateSystemPrompt(name, locale),
        },
        ...messages,
      ],
    })

    return result.toDataStreamResponse()
  } catch (streamError) {
    logChatError(streamError)
    return NextResponse.json(
      {
        response: defaultErrorMessage,
      },
      { status: 200 },
    )
  }
}
