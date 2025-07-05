import { StreamTextResult } from 'ai'

import { weatherTool } from '../tools/weather'

type AllTools = {
  getWeather: typeof weatherTool
}

export function cleanReasoningText(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export type MessagePart = {
  type: 'text' | 'tool-invocation' | 'reasoning' | 'source'
  text?: string
  toolInvocation?: {
    toolCallId: string
    toolName: string
    args: Record<string, unknown>
    state: 'call' | 'result' | 'partial-call'
    callTimestamp?: Date
    resultTimestamp?: Date
    result?: unknown | unknown[] | null
  }
  toolResult?: {
    toolCallId: string
    toolName: string
    result: unknown
    state: 'call' | 'result' | 'partial-call'
  }
  reasoning?: string
}

type ToolCall = {
  toolCallId: string
  toolName: string
  args: Record<string, unknown>
}

type ToolResult = {
  toolCallId: string
  toolName: string
  result: unknown
}

export function extractTextFromParts(parts: MessagePart[]): string {
  if (!parts || parts.length === 0) return ''

  const textFromParts = parts
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text)
    .join(' ')

  if (!textFromParts && parts.some((part) => part.type === 'tool-invocation')) {
    const toolInvocation = parts.find(
      (p) => p.type === 'tool-invocation',
    )?.toolInvocation

    if (
      toolInvocation?.toolName === 'getWeather' &&
      toolInvocation?.args?.location
    ) {
      const location = toolInvocation.args.location
      return `[Consulta de previsão do tempo para ${location}]`
    }

    return `[Consulta de informações com ferramentas]`
  }

  return textFromParts || ''
}

export async function processStreamResult(
  stream: StreamTextResult<AllTools, never>,
) {
  try {
    const text = await stream.text
    const toolCalls = await stream.toolCalls
    const toolResults = await stream.toolResults
    const reasoning = await stream.reasoning

    const parts: MessagePart[] = []

    if (text && text.trim()) {
      parts.push({
        type: 'text',
        text: text.trim(),
      })
    }

    if (reasoning && reasoning.trim()) {
      parts.push({
        type: 'reasoning',
        reasoning: cleanReasoningText(reasoning),
      })
    }

    let argsToResult: Record<string, unknown> = {}

    if (toolCalls && toolCalls.length > 0) {
      toolCalls.forEach((toolCall: ToolCall, index) => {
        const part: MessagePart = {
          type: 'tool-invocation',
          toolInvocation: {
            toolCallId: toolCall.toolCallId || `tool-${Date.now()}-${index}`,
            toolName: toolCall.toolName,
            state: 'call' as const,
            args: toolCall.args,
            callTimestamp: new Date(),
            result: null,
          },
        }
        argsToResult = toolCall.args
        parts.push(part)
      })
    }

    if (toolResults && toolResults.length > 0) {
      toolResults.forEach((result: ToolResult) => {
        const part: MessagePart = {
          type: 'tool-invocation',
          toolInvocation: {
            toolCallId: result.toolCallId,
            toolName: result.toolName,
            state: 'result' as const,
            args: argsToResult,
            resultTimestamp: new Date(),
            result: result.result,
          },
        }
        parts.push(part)
      })
    }

    const finalText =
      text && text.trim() ? text.trim() : extractTextFromParts(parts)

    return {
      text: finalText,
      parts: parts.length > 0 ? parts : null,
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

export function reconstructMessageParts(parts: MessagePart[]): MessagePart[] {
  if (!parts || !Array.isArray(parts)) return []

  try {
    return parts.map((part) => {
      return part
    })
  } catch (error) {
    console.error('Error reconstructing message parts:', error)
    return []
  }
}
