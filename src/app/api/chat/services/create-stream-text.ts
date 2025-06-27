import { createGoogleGenerativeAI } from '@ai-sdk/google'
import {
  extractReasoningMiddleware,
  Message,
  streamText,
  wrapLanguageModel,
} from 'ai'

type CreateStreamTextParams = {
  messages: Message[]
  userId?: string
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const model = wrapLanguageModel({
  model: google('gemini-1.5-flash-latest'),
  middleware: [extractReasoningMiddleware({ tagName: 'think' })],
})

export async function createStreamText({ messages }: CreateStreamTextParams) {
  const stream = streamText({
    model,
    temperature: 0.3,
    maxTokens: 2000,
    messages,
  })

  if (!stream) {
    return {
      stream: null,
      error: 'Error creating stream.',
    }
  }

  return {
    stream,
    error: null,
  }
}
