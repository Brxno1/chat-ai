import { MessagePart, StreamResult } from '@/types/chat'

import { extractTextFromParts } from '../utils/message-parts'

export async function processStreamResult(stream: StreamResult) {
  try {
    const text = await stream.text
    const toolResults = await stream.toolResults
    const reasoning = await stream.reasoning

    const parts: MessagePart[] = []

    if (text && text.trim()) {
      parts.push({
        type: 'text',
        text: text.trim(),
      })
    }

    if (reasoning && reasoning.length > 0) {
      const reasoningText = reasoning
        .filter((r) => 'text' in r && typeof r.text === 'string')
        .map((r) => (r as { text: string }).text)
        .join('\n')
      if (reasoningText) {
        parts.push({
          type: 'reasoning',
          reasoning: reasoningText,
        })
      }
    }

    if (toolResults) {
      for (const result of toolResults) {
        if ('toolCallId' in result && 'toolName' in result) {
          const part: MessagePart = {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: result.toolCallId,
              toolName: result.toolName as 'getWeather' | 'getNews',
              state: 'result' as const,
              callTimestamp: new Date().getTime(),
              args:
                'args' in result
                  ? (result.args as Record<string, unknown>)
                  : {},
              result: 'output' in result ? result.output : undefined,
            },
          }
          parts.push(part)
        }
      }
    }

    const finalText = text ? text.trim() : extractTextFromParts(parts)

    return {
      text: finalText,
      parts,
      usage: null,
    }
  } catch (error) {
    try {
      const fallbackText = await stream.text
      return {
        text: fallbackText || '[Resposta do assistente]',
        parts: null,
        usage: null,
      }
    } catch (fallbackError) {
      return {
        text: '[Resposta do assistente]',
        parts: null,
        usage: null,
      }
    }
  }
}
