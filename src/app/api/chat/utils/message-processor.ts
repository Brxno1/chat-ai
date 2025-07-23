import { Message } from '@ai-sdk/react'

import { TextUIPart } from '../../../../../@types/ai-sdk'

export function extractTextFromMessage(message: Message): string {
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === 'text' && part.text)
      .map((part) => (part as TextUIPart).text)
      .join(' ')
  }

  if (typeof message.content === 'string') {
    return message.content
  }

  return ''
}

export function formatMessageForStorage(message: Message) {
  const role = message.role.toLowerCase() === 'user' ? 'USER' : 'ASSISTANT'
  const textContent = extractTextFromMessage(message)
  const parts = [{ type: 'text', text: textContent }]
  const partsString = JSON.stringify(parts)

  return {
    role,
    parts: partsString,
  }
}
