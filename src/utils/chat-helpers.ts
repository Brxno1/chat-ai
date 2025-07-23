import type { ChatMessage as ChatMessageType } from '@/types/chat'

export function getResultToolCallIds(message: ChatMessageType) {
  return new Set(
    message.parts
      ?.filter((part) => part.type === 'tool-invocation')
      .map(
        (part) =>
          (part as { toolInvocation?: { toolCallId: string; state: string } })
            .toolInvocation,
      )
      .filter(
        (ti): ti is { toolCallId: string; state: string } =>
          ti?.state === 'result' && !!ti.toolCallId,
      )
      .map((ti) => ti.toolCallId),
  )
}

export function extractReasoningParts(message: ChatMessageType) {
  const reasoningParts =
    message.parts
      ?.filter((part) => part.type === 'reasoning')
      .map((p) => p.reasoning!)
      .join(' ') || ''

  return reasoningParts
}
