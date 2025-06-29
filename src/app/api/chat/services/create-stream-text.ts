import { createGoogleGenerativeAI } from '@ai-sdk/google'
import {
  extractReasoningMiddleware,
  Message,
  streamText,
  wrapLanguageModel,
} from 'ai'

import { countTodosTool } from './counter-todos-tool'
import { weatherTool } from './weather'

type CreateStreamTextParams = {
  messages: Message[]
  userId?: string
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const model = wrapLanguageModel({
  model: google('gemini-2.0-flash-thinking-exp-01-21'),
  middleware: [extractReasoningMiddleware({ tagName: 'think' })],
})

export async function createStreamText({ messages }: CreateStreamTextParams) {
  const stream = streamText({
    model,
    temperature: 0.3,
    maxTokens: 2000,
    maxSteps: 1,
    messages,
    tools: {
      displayWeather: weatherTool,
      count_todos: countTodosTool,
    },
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
