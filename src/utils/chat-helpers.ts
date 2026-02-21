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
  return message.parts
    .filter((part) => part.type === 'reasoning')
    .map((p) => {
      const part = p as typeof p & { reasoning: string }
      return part.reasoning
    })
    .join(' ')
}
