import { openai } from '@ai-sdk/openai'
import { Message, streamText } from 'ai'

import { chatConfig } from '../config'

export async function createStreamText(messages: Message[], model: string) {
  const stream = streamText({
    model: openai(model),
    temperature: chatConfig.temperature,
    maxTokens: chatConfig.maxTokens,
    messages,
    onError: (error) => {
      console.error('Error creating streamText:', error)
    },
  })

  if (!stream) {
    console.error('Error creating streamText: The stream is null.', {
      model,
      messages,
      chatConfig,
    })
    return {
      stream: null,
      error: 'Error creating stream.',
    }
  }

  return {
    stream,
  }
}
