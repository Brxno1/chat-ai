import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  smoothStream,
  streamText,
  UIMessage,
  wrapLanguageModel,
} from 'ai'

import { env } from '@/lib/env'
import type { Model } from '@/types/model'

import { newsTool } from '../tools/news'
import { weatherTool } from '../tools/weather'
import { errorHandler } from '../utils/error-handler'

const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
})

const nvidia = createOpenAICompatible({
  name: 'nvidia',
  baseURL: env.NVIDIA_BASE_URL,
  apiKey: env.NVIDIA_API_KEY,
})

const isGoogleModel = (id: string) =>
  id.startsWith('gemini') || id.startsWith('gemma')

type CreateStreamTextParams = {
  messages: UIMessage[]
  modelId: Model['id']
}

export async function createStreamText({
  messages,
  modelId,
}: CreateStreamTextParams) {
  const getModel = () => {
    if (isGoogleModel(modelId)) {
      return google(modelId)
    }
    return nvidia(modelId)
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
      messages: await convertToModelMessages(messages),
      experimental_transform: [
        smoothStream({
          chunking: 'line',
          delayInMs: 80,
        }),
      ],
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
