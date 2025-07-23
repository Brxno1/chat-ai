import { Message } from '@ai-sdk/react'

export function filterValidMessages(messages: Message[]): Message[] {
  return messages.filter((message) => {
    if (!message.content || typeof message.content !== 'string') {
      return false
    }

    if (message.content.trim().length === 0) {
      return false
    }

    if (!message.role || !['user', 'assistant'].includes(message.role)) {
      return false
    }

    return true
  })
}

export function validateMessages(messages: Message[]): boolean {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false
  }

  const hasSystemMessage = messages.some((msg) => msg.role === 'system')
  if (!hasSystemMessage) {
    return false
  }

  return messages.every((msg) => {
    if (msg.role === 'system') return true
    return msg.content && msg.content.trim().length > 0
  })
}

export function removeDuplicateMessages(messages: Message[]): Message[] {
  if (messages.length <= 1) return messages

  const uniqueMessages: Message[] = []
  const seenMessages = new Set<string>()

  for (const message of messages) {
    const messageKey = `${message.role}:${message.content}`

    if (!seenMessages.has(messageKey)) {
      uniqueMessages.push(message)
      seenMessages.add(messageKey)
    }
  }

  return uniqueMessages
}

export function processToolInvocations(messages: Message[]): Message[] {
  const uniqueMessages = messages.filter((message, index) => {
    if (index === 0) return true

    if (message.role === 'user') return true

    const prevMessage = messages[index - 1]
    return !(
      message.role === prevMessage.role &&
      message.content === prevMessage.content
    )
  })

  return uniqueMessages.map((message, index) => {
    if (
      message.role === 'assistant' &&
      message.content.includes('tool-invocation')
    ) {
      const hasResultAfter = uniqueMessages
        .slice(index + 1)
        .some(
          (msg) =>
            msg.role === 'assistant' && msg.content.includes('já obtidos'),
        )

      if (hasResultAfter) {
        return {
          ...message,
          content: '[Consulta anterior já processada]',
        }
      }
    }

    return message
  })
}
