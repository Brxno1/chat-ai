import { createGoogleGenerativeAI } from '@ai-sdk/google'
import {
  convertToCoreMessages,
  extractReasoningMiddleware,
  Message,
  streamText,
  wrapLanguageModel,
} from 'ai'

import type { Model } from '@/types/model'

import { newsTool } from '../tools/news'
import { weatherTool } from '../tools/weather'
import { errorHandler } from '../utils/error-handler'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

type CreateStreamTextParams = {
  messages: Message[]
  modelId: Model['id']
}

export async function createStreamText({
  messages,
  modelId,
}: CreateStreamTextParams) {
  const model = wrapLanguageModel({
    model: google(modelId),
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
