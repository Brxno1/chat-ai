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
      stream: null,
      error: 'Mensagens não fornecidas',
    }
  }

  const model = wrapLanguageModel({
    model: google(modelId),
    middleware: [extractReasoningMiddleware({ tagName: 'think' })],
  })

  try {
    const normalizedMessages = normalizeMessagesForStream(messages)
    let errorMessage: string | null = null

    const stream = streamText({
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
        console.log('error on streamText', error)
        errorMessage = errorHandler(error)
      },
    })

    if (!stream) {
      return {
        stream: null,
        error: errorMessage,
      }
    }

    return {
      stream,
      error: null,
    }
  } catch (error) {
    return {
      stream: null,
      error: errorHandler(error),
    }
  }
}
