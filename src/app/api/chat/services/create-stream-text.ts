import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { Message, streamText } from 'ai'

import { chatConfig } from '../config'
import { countTodosTool } from './counter-todos-tool'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

type CreateStreamTextParams = {
  messages: Message[]
  userId?: string
}

export async function createStreamText({ messages }: CreateStreamTextParams) {
  const sanitizedMessages = messages.map((message) => {
    if (Array.isArray(message.content)) {
      return {
        ...message,
        content: message.content
          .map((part) => {
            if (typeof part === 'string') return part
            if (part.type === 'text') return part.text
            return JSON.stringify(part)
          })
          .join(' '),
      }
    }
    return message
  })

  const stream = streamText({
    model: google('gemini-1.5-flash-8b-latest'),
    temperature: chatConfig.temperature,
    maxTokens: chatConfig.maxTokens,
    messages: sanitizedMessages,
    tools: {
      count_todos: countTodosTool,
    },
    toolChoice: 'auto',
    maxSteps: 2,
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
