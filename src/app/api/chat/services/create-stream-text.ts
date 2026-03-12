import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  smoothStream,
  streamText,
  type StreamTextOnFinishCallback,
  type UIMessage,
  wrapLanguageModel,
} from 'ai'

import { env } from '@/lib/env'
import type { AllTools } from '@/types/chat'

import { newsTool, weatherTool } from '../tools'
import { errorHandler } from '../utils/error-handler'

type OnFinishCallback = StreamTextOnFinishCallback<AllTools>

type CreateStreamTextParams = {
  messages: UIMessage[]
  modelId: string
  onFinish?: OnFinishCallback
}

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

const tools = {
  getWeather: weatherTool,
  getNews: newsTool,
} as AllTools

export async function createStreamText({
  messages,
  modelId,
  onFinish,
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
      onFinish,
      toolChoice: 'auto',
      tools,
      onError: (error) => console.error(error),
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
