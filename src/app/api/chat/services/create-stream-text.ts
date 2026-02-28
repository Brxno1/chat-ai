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
import type { AllTools } from '@/types/chat'

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

type OnFinishCallback = Parameters<typeof streamText>[0]['onFinish']

type CreateStreamTextParams = {
  messages: UIMessage[]
  modelId: string
  onFinish?: OnFinishCallback
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
    const streamResult = streamText({
      model,
      temperature: 0.8,
      messages: await convertToModelMessages(messages),
      experimental_transform: [
        smoothStream({
          chunking: 'line',
          delayInMs: 25,
        }),
      ],
      toolChoice: 'auto',
      tools: {
        getWeather: weatherTool,
        getNews: newsTool,
      } as AllTools,
      onError: (error) => {
        console.error('createStreamText onError:', error)
      },
    })

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
