/* eslint-disable @typescript-eslint/no-explicit-any */

import { Message } from 'ai'

type Role = 'user' | 'assistant'

type InputMessage = {
  role: Role
  content: string
}

type DatabaseMessage = {
  id: string
  content: string
  role: string
  parts?: unknown
  createdAt: Date
}

/**
 * Filtra mensagens para remover conteúdo vazio ou inválido
 * que pode causar erro "contents.parts must not be empty"
 */
export function filterValidMessages(messages: InputMessage[]): InputMessage[] {
  return messages.filter((message) => {
    // Verificar se a mensagem tem conteúdo válido
    if (!message.content || typeof message.content !== 'string') {
      return false
    }

    // Remover mensagens com apenas espaços em branco
    if (message.content.trim().length === 0) {
      return false
    }

    // Verificar se o role é válido
    if (!message.role || !['user', 'assistant'].includes(message.role)) {
      return false
    }

    return true
  })
}

/**
 * Converte mensagens de entrada para o formato Message do AI SDK
 * garantindo que não há conteúdo vazio
 */
export function createFinalMessages(
  messages: InputMessage[],
  systemPrompt: string,
): Message[] {
  const validMessages = filterValidMessages(messages)

  const finalMessages: Message[] = [
    {
      id: 'system',
      role: 'system',
      content: systemPrompt,
    },
    ...validMessages.map((message, index) => ({
      id: `message-${index}`,
      role: message.role,
      content: message.content,
    })),
  ]

  // Filtro final para garantir que não há mensagens com conteúdo vazio
  return finalMessages.filter((msg) => {
    if (msg.role === 'system') return true
    return msg.content && msg.content.trim().length > 0
  })
}

/**
 * Converte mensagens do banco para formato seguro para a AI
 * Remove tool invocations para evitar reexecução
 */
export function convertDatabaseMessagesToAI(
  dbMessages: DatabaseMessage[],
): InputMessage[] {
  return dbMessages
    .map((msg) => {
      const role = msg.role.toLowerCase() as Role

      // Para mensagens que eram tool invocations, usar um texto descritivo
      if (
        msg.content === '[Usou ferramenta(s)]' ||
        msg.content.includes('[Usou')
      ) {
        // Se tem parts salvas, extrair um resumo da ferramenta usada
        if (msg.parts) {
          try {
            const parts =
              typeof msg.parts === 'string' ? JSON.parse(msg.parts) : msg.parts

            console.log('🔍 DEBUG parts da mensagem:', {
              messageContent: msg.content.substring(0, 50) + '...',
              parts,
            })

            if (Array.isArray(parts)) {
              const toolInvocations = parts.filter(
                (part: unknown) =>
                  typeof part === 'object' &&
                  part !== null &&
                  'type' in part &&
                  part.type === 'tool-invocation',
              )

              if (toolInvocations.length > 0) {
                // Extrair informações específicas das ferramentas para contexto mais útil
                const toolDetails = toolInvocations
                  .map((inv: unknown) => {
                    if (
                      typeof inv === 'object' &&
                      inv !== null &&
                      'toolInvocation' in inv &&
                      typeof inv.toolInvocation === 'object' &&
                      inv.toolInvocation !== null &&
                      'toolName' in inv.toolInvocation &&
                      'args' in inv.toolInvocation
                    ) {
                      const toolName = inv.toolInvocation.toolName
                      const args = inv.toolInvocation.args as any

                      // Para getWeather, incluir as cidades consultadas
                      if (toolName === 'getWeather' && args?.location) {
                        const locations = Array.isArray(args.location)
                          ? args.location
                          : [args.location]
                        return `${toolName} para ${locations.join(', ')}`
                      }

                      return toolName
                    }
                    return null
                  })
                  .filter(Boolean)

                if (toolDetails.length > 0) {
                  return {
                    role,
                    content: `[Consulta anterior: ${toolDetails.join(', ')} - dados já obtidos]`,
                  }
                }
              }
            }
          } catch (error) {
            console.error('Erro ao processar parts para contexto da AI:', error)
          }
        }

        return {
          role,
          content: '[Assistente usou ferramentas - resultados já processados]',
        }
      }

      // Para outras mensagens, usar o conteúdo normal
      return {
        role,
        content: msg.content,
      }
    })
    .filter(
      (msg): msg is InputMessage =>
        msg.role === 'user' || msg.role === 'assistant',
    )
}

/**
 * Verifica se uma lista de mensagens é válida para envio à API
 */
export function validateMessages(messages: Message[]): boolean {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false
  }

  // Verificar se há pelo menos uma mensagem do sistema
  const hasSystemMessage = messages.some((msg) => msg.role === 'system')
  if (!hasSystemMessage) {
    return false
  }

  // Verificar se todas as mensagens têm conteúdo válido
  return messages.every((msg) => {
    if (msg.role === 'system') return true
    return msg.content && msg.content.trim().length > 0
  })
}

/**
 * Remove duplicatas de mensagens consecutivas com mesmo conteúdo
 */
export function removeDuplicateMessages(
  messages: InputMessage[],
): InputMessage[] {
  if (messages.length <= 1) return messages

  return messages.filter((message, index) => {
    if (index === 0) return true

    const prevMessage = messages[index - 1]
    return !(
      message.role === prevMessage.role &&
      message.content === prevMessage.content
    )
  })
}
