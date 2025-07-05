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

function processMessages(messages: Message[]): Message[] {
  return messages.map((msg, index) => {
    if (msg.role !== 'assistant' || msg.content.trim() !== '') {
      return msg
    }

    const nextMessage = messages[index + 1]
    if (!nextMessage || nextMessage.role !== 'user') {
      return msg
    }

    if (msg.parts?.some((part) => part.type === 'tool-invocation')) {
      return {
        ...msg,
        content: 'Processando sua solicitação usando ferramentas...',
      }
    }

    return msg
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
    const processedMessages = processMessages(messages)

    const stream = streamText({
      model,
      temperature: 0.2,
      maxTokens: 2000,
      maxSteps: 1,
      messages: processedMessages,
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
    return {
      stream: null,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao criar stream',
    }
  }
}
