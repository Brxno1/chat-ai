import { type UIMessage } from 'ai'

function getTextFromParts(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
}

export function filterValidMessages(messages: UIMessage[]): UIMessage[] {
  return messages.filter((message) => {
    const text = getTextFromParts(message)
    if (!text || text.trim().length === 0) {
      return false
    }

    if (!message.role || !['user', 'assistant'].includes(message.role)) {
      return false
    }

    return true
  })
}

export function validateMessages(messages: UIMessage[]): boolean {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false
  }

  return messages.every((msg) => {
    const text = getTextFromParts(msg)
    return text && text.trim().length > 0
  })
}

export function removeDuplicateMessages(messages: UIMessage[]): UIMessage[] {
  if (messages.length <= 1) return messages

  const uniqueMessages: UIMessage[] = []
  const seenMessages = new Set<string>()

  for (const message of messages) {
    const text = getTextFromParts(message)
    const messageKey = `${message.role}:${text}`

    if (!seenMessages.has(messageKey)) {
      uniqueMessages.push(message)
      seenMessages.add(messageKey)
    }
  }

  return uniqueMessages
}

export function processToolInvocations(messages: UIMessage[]): UIMessage[] {
  const uniqueMessages = messages.filter((message, index) => {
    if (index === 0) return true

    if (message.role === 'user') return true

    const prevMessage = messages[index - 1]
    const currentText = getTextFromParts(message)
    const prevText = getTextFromParts(prevMessage)
    return !(message.role === prevMessage.role && currentText === prevText)
  })

  return uniqueMessages.map((message, index) => {
    const text = getTextFromParts(message)
    if (message.role === 'assistant' && text.includes('tool-invocation')) {
      const hasResultAfter = uniqueMessages.slice(index + 1).some((msg) => {
        const msgText = getTextFromParts(msg)
        return msg.role === 'assistant' && msgText.includes('já obtidos')
      })

      if (hasResultAfter) {
        return {
          ...message,
          parts: [
            {
              type: 'text' as const,
              text: '[Consulta anterior já processada]',
            },
          ],
        }
      }
    }

    return message
  })
}
