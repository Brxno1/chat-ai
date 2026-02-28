import type { UIMessage } from 'ai'

interface ToolPartShape {
  type: string
  state: string
  toolCallId: string
}

const DONE_STATES = new Set(['result', 'output-available', 'done'])

function isCompletedToolPart(
  part: UIMessage['parts'][number],
): part is UIMessage['parts'][number] & ToolPartShape {
  if (!part.type.startsWith('tool-')) return false
  if (!('state' in part) || !('toolCallId' in part)) return false
  return DONE_STATES.has(String((part as ToolPartShape).state))
}

export function getResultToolCallIds(message: UIMessage) {
  return new Set(
    message.parts.filter(isCompletedToolPart).map((part) => part.toolCallId),
  )
}

export function extractReasoningParts(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'reasoning')
    .map((part) => part.text)
    .join(' ')
}
