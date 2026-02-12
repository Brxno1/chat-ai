import type { UIMessage } from 'ai'

export function getResultToolCallIds(message: UIMessage) {
  return new Set(
    message.parts
      .filter((part) => part.type.startsWith('tool-'))
      .filter((part) => {
        const toolPart = part as { state?: string; toolCallId?: string }
        const hasResult =
          toolPart.state === 'result' ||
          toolPart.state === 'output-available' ||
          toolPart.state === 'done'
        return hasResult && !!toolPart.toolCallId
      })
      .map((part) => (part as { toolCallId: string }).toolCallId),
  )
}

export function extractReasoningParts(message: UIMessage) {
  const reasoningParts =
    message.parts
      .filter((part) => part.type === 'reasoning')
      .map((p) => (p as { text: string }).text)
      .join(' ') || ''

  return reasoningParts
}
