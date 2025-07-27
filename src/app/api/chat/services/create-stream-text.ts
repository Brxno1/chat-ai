import { createGoogleGenerativeAI } from '@ai-sdk/google'
import {
  extractReasoningMiddleware,
  Message,
  streamText,
  wrapLanguageModel,
} from 'ai'

import { newsTool } from '../tools/news'
import { weatherTool } from '../tools/weather'
import { errorHandler } from '../utils/error-handler'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

function normalizeMessagesForStream(messages: Message[]): Message[] {
  return messages.map((message) => {
    const { parts, ...cleanMessage } = message

    const normalizedParts = parts?.map((part) => {
      if (!('details' in part)) {
        return {
          ...part,
          details: [],
        }
      }
      return part
    })
    return { ...cleanMessage, parts: normalizedParts }
  })
}

type CreateStreamTextParams = {
  messages: Message[]
  modelId: string
}

export async function createStreamText({
  messages,
  modelId,
}: CreateStreamTextParams) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      streamResult: null,
      streamError: 'Mensagens não fornecidas',
    }
  }

  const model = wrapLanguageModel({
    model: google(modelId),
    middleware: [extractReasoningMiddleware({ tagName: 'think' })],
  })

  try {
    const normalizedMessages = normalizeMessagesForStream(messages)
    let errorMessage: string | null = null

    const streamResult = streamText({
      model,
      temperature: 0.2,
      maxTokens: 2000,
      maxSteps: 1,
      messages: normalizedMessages,
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
