import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  convertToCoreMessages,
  extractReasoningMiddleware,
  Message,
  streamText,
  wrapLanguageModel,
} from 'ai'

import type { Model } from '@/types/model'
import { env } from '@/lib/env'

import { newsTool } from '../tools/news'
import { weatherTool } from '../tools/weather'
import { errorHandler } from '../utils/error-handler'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const compatibleAi = createOpenAICompatible({
  name: 'qwen/qwen3-4b-thinking-2507',
  baseURL: env.LM_STUDIO_URL,
})

type CreateStreamTextParams = {
  messages: Message[]
  modelId: Model['id']
}

export async function createStreamText({
  messages,
  modelId,
}: CreateStreamTextParams) {
  const getModel = () => {
    if (modelId === 'qwen/qwen3-4b-thinking-2507') {
      return compatibleAi(modelId)
    }
    return google(modelId)
  }

  const model = wrapLanguageModel({
    model: getModel(),
    middleware: [extractReasoningMiddleware({ tagName: 'think' })],
  })

  try {
    let errorMessage: string | null = null

    const streamResult = streamText({
      model,
      temperature: 0.8,
      maxSteps: 1,
      messages: convertToCoreMessages(messages),
      toolChoice: 'auto',
      tools: {
        getWeather: weatherTool,
        getNews: newsTool,
      },
      onError: (error) => {
        errorMessage = errorHandler(error)
      },
    })

    if (!streamResult) {
      return {
        streamResult: null,
        streamError: errorMessage,
      }
    }

    return {
      streamResult,
      streamError: null,
    }
  } catch (error) {
    return {
      streamResult: null,
      streamError: errorHandler(error),
    }
  }
}
