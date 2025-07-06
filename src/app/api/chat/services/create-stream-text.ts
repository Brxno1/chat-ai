import { createGoogleGenerativeAI } from '@ai-sdk/google'
import {
  extractReasoningMiddleware,
  Message,
  streamText,
  wrapLanguageModel,
} from 'ai'

import { weatherTool } from '../tools/weather'

type CreateStreamTextParams = {
  messages: Message[]
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const model = wrapLanguageModel({
  model: google('gemini-1.5-flash-latest'),
  middleware: [extractReasoningMiddleware({ tagName: 'think' })],
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

export async function createStreamText({ messages }: CreateStreamTextParams) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      stream: null,
      error: 'Mensagens não fornecidas',
    }
  }

  try {
    const normalizedMessages = normalizeMessagesForStream(messages)

    const stream = streamText({
      model,
      temperature: 0.2,
      maxTokens: 2000,
      maxSteps: 1,
      messages: normalizedMessages,
      toolChoice: 'auto',
      tools: {
        getWeather: weatherTool,
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
  } catch (error) {
    console.error('Error creating stream:', error)
    return {
      stream: null,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao criar stream',
    }
  }
}
