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

  // Se não há texto, mas há tool invocations, criar um resumo
  if (!textParts && parts.some((part) => part.type === 'tool-invocation')) {
    const toolInvocations = parts.filter(
      (part) => part.type === 'tool-invocation',
    )
    return `[Usou ${toolInvocations.length} ferramenta(s)]`
  }

  return textParts || ''
}

/**
 * Processa o stream result para extrair texto e parts
 */
export async function processStreamResult(
  stream: StreamTextResult<any, never>,
) {
  console.log('🚀 processStreamResult iniciado')

  try {
    // Aguardar as promises do stream
    console.log('⏳ Aguardando promises do stream...')
    const text = await stream.text
    const toolCalls = await stream.toolCalls
    const toolResults = await stream.toolResults

    console.log('📊 Stream result detalhado:', {
      hasText: !!text,
      textLength: text?.length,
      toolCallsCount: toolCalls.length,
      toolResultsCount: toolResults.length,
      toolCallsData: toolCalls.map((tc) => ({
        name: tc.toolName,
        args: tc.args,
      })),
      toolResultsData: toolResults.map((tr) => ({
        name: tr.toolName,
        hasResult: !!tr.result,
      })),
    })

    // Construir as parts baseadas no que foi retornado
    const parts: MessagePart[] = []

    // Adicionar texto se houver
    if (text && text.trim()) {
      parts.push({
        type: 'text',
        text: text.trim(),
      })
      console.log('📝 Adicionada part de texto:', text.substring(0, 50) + '...')
    }

    // Adicionar tool calls se houver
    if (toolCalls && toolCalls.length > 0) {
      toolCalls.forEach((toolCall: ToolCall, index: number) => {
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
        console.log(`🔧 Adicionada tool invocation ${index + 1}:`, {
          toolName: toolCall.toolName,
          toolCallId: part.toolInvocation.toolCallId,
          args: toolCall.args,
        })
      })
    }

    // Adicionar tool results se houver
    if (toolResults && toolResults.length > 0) {
      toolResults.forEach((result: ToolResult, index: number) => {
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
        console.log(`📊 Adicionado tool result ${index + 1}:`, {
          toolName: result.toolName,
          toolCallId: result.toolCallId,
          hasResult: !!result.result,
        })
      })
    }

    const finalText = extractTextFromParts(parts)

    console.log('🎯 Processamento finalizado:', {
      finalText: finalText.substring(0, 100) + '...',
      totalParts: parts.length,
      partTypes: parts.map((p) => p.type),
    })

    return {
      text: finalText,
      parts: parts.length > 0 ? parts : null,
      usage: null,
    }
  } catch (error) {
    console.error('❌ Erro ao processar stream result:', error)

    // Fallback: tentar extrair texto diretamente do stream
    try {
      console.log('🔄 Tentando fallback...')
      const fallbackText = await stream.text
      console.log(
        '✅ Fallback bem-sucedido:',
        fallbackText?.substring(0, 50) + '...',
      )
      return {
        text: fallbackText || '[Resposta do assistente]',
        parts: null,
        usage: null,
      }
    } catch (fallbackError) {
      console.error('❌ Fallback também falhou:', fallbackError)
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
  if (!savedParts || !Array.isArray(savedParts)) return null

  return savedParts.map((part) => ({
    type: part.type,
    text: part.text || undefined,
    toolInvocation: part.toolInvocation || undefined,
    toolResult: part.toolResult || undefined,
    reasoning: part.reasoning || undefined,
  }))
}
