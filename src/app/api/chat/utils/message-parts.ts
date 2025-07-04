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
  type: string
  text?: string
  toolInvocation?: {
    toolCallId: string
    toolName: string
    args: Record<string, unknown>
    state: 'call' | 'result'
    callTimestamp?: Date
    resultTimestamp?: Date
    result: unknown | unknown[] | null
  }
  toolResult?: {
    toolCallId: string
    toolName: string
    result: unknown
    state: string
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

  const textParts = parts
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text)
    .join(' ')

  if (!textParts && parts.some((part) => part.type === 'tool-invocation')) {
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

  return textParts || ''
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
        const part = {
          type: 'tool-invocation',
          toolInvocation: {
            toolCallId: toolCall.toolCallId || `tool-${Date.now()}-${index}`,
            toolName: toolCall.toolName,
            args: toolCall.args,
            state: 'call' as const,
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
        const part = {
          type: 'tool-invocation',
          toolInvocation: {
            toolCallId: result.toolCallId,
            toolName: result.toolName,
            args: argsToResult,
            state: 'result' as const,
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

/**
 * Converte parts salvas no banco de volta para o formato esperado pela UI
 */
export function reconstructMessageParts(savedParts: unknown): MessagePart[] {
  if (!savedParts) return []

  try {
    const partsArray =
      typeof savedParts === 'string' ? JSON.parse(savedParts) : savedParts

    if (!Array.isArray(partsArray)) return []

    return partsArray.map((part) => {
      const typedPart: MessagePart = {
        type: part.type || 'text',
      }

      if (part.text) typedPart.text = part.text
      if (part.toolInvocation) typedPart.toolInvocation = part.toolInvocation
      if (part.toolResult) typedPart.toolResult = part.toolResult
      if (part.reasoning) typedPart.reasoning = part.reasoning

      return typedPart
    })
  } catch (error) {
    console.error('Erro ao reconstruir message parts:', error)
    return []
  }
}
