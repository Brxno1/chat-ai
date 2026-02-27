import { type UIMessage } from 'ai'

function getTextFromParts(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
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
