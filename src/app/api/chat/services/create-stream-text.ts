import { openai } from '@ai-sdk/openai'
import { Message, streamText } from 'ai'

import { chatConfig } from '../config'

export async function createStreamText(messages: Message[], model: string) {
  const stream = streamText({
    model: openai(model),
    temperature: chatConfig.temperature,
    maxTokens: chatConfig.maxTokens,
    messages,
  })

  if (!stream) {
    console.error('Error creating streamText: The stream is null.')

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
