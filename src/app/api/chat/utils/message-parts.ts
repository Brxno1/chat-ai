/* eslint-disable @typescript-eslint/no-explicit-any */

import { StreamTextResult } from 'ai'

type MessagePart = {
  type: string
  text?: string
  toolInvocation?: {
    toolCallId: string
    toolName: string
    args: Record<string, unknown>
    state: string
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

/**
 * Extrai o texto de uma mensagem com parts para salvar no campo content
 */
export function extractTextFromParts(parts: MessagePart[]): string {
  if (!parts || parts.length === 0) return ''

  const textParts = parts
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text)
    .join(' ')

  // Se não temos texto mas temos invocação de ferramenta
  if (!textParts && parts.some((part) => part.type === 'tool-invocation')) {
    // Tentar obter o nome da ferramenta e localização para uma mensagem mais amigável
    const toolInvocation = parts.find(
      (p) => p.type === 'tool-invocation',
    )?.toolInvocation

    if (
      toolInvocation?.toolName === 'getWeather' &&
      toolInvocation?.args?.location
    ) {
      const location = toolInvocation.args.location
      return `[Consultando previsão do tempo para ${location}]`
    }

    return `[Consultando informações com ferramentas]`
  }

  return textParts || ''
}

/**
 * Processa o stream result para extrair texto e parts
 */
export async function processStreamResult(
  stream: StreamTextResult<any, never>,
) {
  try {
    const text = await stream.text
    const toolCalls = await stream.toolCalls
    const toolResults = await stream.toolResults

    // Construir as parts baseadas no que foi retornado
    const parts: MessagePart[] = []

    // Adicionar texto se houver
    if (text && text.trim()) {
      parts.push({
        type: 'text',
        text: text.trim(),
      })
    }

    // Adicionar tool calls se houver
    if (toolCalls && toolCalls.length > 0) {
      toolCalls.forEach((toolCall: ToolCall, index) => {
        const part = {
          type: 'tool-invocation',
          toolInvocation: {
            toolCallId: toolCall.toolCallId || `tool-${Date.now()}-${index}`,
            toolName: toolCall.toolName,
            args: toolCall.args,
            state: 'call',
          },
        }
        parts.push(part)
      })
    }

    if (toolResults && toolResults.length > 0) {
      toolResults.forEach((result: ToolResult) => {
        const part = {
          type: 'tool-result',
          toolResult: {
            toolCallId: result.toolCallId,
            toolName: result.toolName,
            result: result.result,
            state: 'result',
          },
        }
        parts.push(part)
      })
    }

    const finalText = extractTextFromParts(parts)

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
export function reconstructMessageParts(
  savedParts: unknown,
): MessagePart[] | null {
  if (!savedParts) return null

  try {
    // Converter string para objeto se necessário
    const partsArray =
      typeof savedParts === 'string' ? JSON.parse(savedParts) : savedParts

    // Validar se é um array
    if (!Array.isArray(partsArray)) return null

    // Mapear partes garantindo a estrutura correta
    return partsArray.map((part) => {
      const typedPart: MessagePart = {
        type: part.type || 'text',
      }

      // Adicionar campos específicos com base no tipo
      if (part.text) typedPart.text = part.text
      if (part.toolInvocation) typedPart.toolInvocation = part.toolInvocation
      if (part.toolResult) typedPart.toolResult = part.toolResult
      if (part.reasoning) typedPart.reasoning = part.reasoning

      return typedPart
    })
  } catch (error) {
    console.error('Erro ao reconstruir message parts:', error)
    return null
  }
}
