import { type UIMessage } from 'ai'

export function extractTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text',
    )
    .map((part) => part.text)
    .join(' ')
}

export function formatMessageForStorage(message: UIMessage) {
  const role = message.role.toLowerCase() === 'user' ? 'USER' : 'ASSISTANT'
  const textContent = extractTextFromMessage(message)
  const parts = [{ type: 'text', text: textContent }]
  const partsString = JSON.stringify(parts)

  return {
    role,
    parts: partsString,
  }
}
