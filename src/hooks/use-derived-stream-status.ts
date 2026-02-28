import { type ChatStatus, type UIMessage } from 'ai'
import { useMemo } from 'react'

import { type ChatStreamStatus } from '@/types/chat'

export function useDerivedStreamStatus(
  status: ChatStatus,
  messages: UIMessage[],
): ChatStreamStatus {
  return useMemo(() => {
    if (status !== 'streaming') return status as ChatStreamStatus

    const lastMsg = messages.at(-1)

    if (!lastMsg || lastMsg.role !== 'assistant') return 'streaming'

    const hasText = lastMsg.parts.some(
      (p) =>
        p.type === 'text' &&
        'text' in p &&
        (p as { text: string }).text.length > 0,
    )

    if (hasText) return 'responding'

    const hasReasoning = lastMsg.parts.some((p) => p.type === 'reasoning')
    if (hasReasoning) return 'thinking'

    return 'streaming'
  }, [status, messages])
}
