import { StreamTextResult } from 'ai'

import { AllTools, MessagePart, ToolResult } from '@/types/chat'

import { extractTextFromParts } from '../utils/message-parts'

export async function processStreamResult(
  stream: StreamTextResult<AllTools, never>,
) {
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

    if (reasoning) {
      parts.push({
        type: 'reasoning',
        reasoning,
      })
    }

    if (toolResults) {
      toolResults.forEach((result: ToolResult) => {
        const part: MessagePart = {
          type: 'tool-invocation',
          toolInvocation: {
            toolCallId: result.toolCallId,
            toolName: result.toolName,
            state: 'result' as const,
            callTimestamp: new Date().getTime(),
            args: result.args,
            result: result.result,
          },
        }
        parts.push(part)
      })
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
