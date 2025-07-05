/* eslint-disable @typescript-eslint/no-explicit-any */

import { Message } from 'ai'

type Role = 'user' | 'assistant'

type InputMessage = {
  role: Role
  content: string
}

type DatabaseMessage = {
  id: string
  role: string
  parts?: unknown
  createdAt: Date
}

/**
 * Extrai texto das parts da mensagem
 */
export function extractTextFromParts(parts: unknown): string {
  if (!parts) return ''

  try {
    const partsArray = typeof parts === 'string' ? JSON.parse(parts) : parts
    if (!Array.isArray(partsArray)) return ''

    const textParts = partsArray
      .filter((part) => part?.type === 'text' && part?.text)
      .map((part) => part.text)
      .join(' ')

    return textParts.trim()
  } catch (error) {
    console.error('Erro ao extrair texto das parts:', error)
    return ''
  }
}

/**
 * Filtra mensagens para remover conteúdo vazio ou inválido
 * que pode causar erro "contents.parts must not be empty"
 */
export function filterValidMessages(messages: InputMessage[]): InputMessage[] {
  return messages.filter((message) => {
    if (!message.content || typeof message.content !== 'string') {
      return false
    }

    if (message.content.trim().length === 0) {
      return false
    }

    if (!message.role || !['user', 'assistant'].includes(message.role)) {
      return false
    }

    return true
  })
}

export function convertDatabaseMessagesToAI(
  dbMessages: DatabaseMessage[],
): InputMessage[] {
  return dbMessages
    .map((msg) => {
      const role = msg.role.toLowerCase() as Role
      const content = extractTextFromParts(msg.parts)

      if (content === '[Usou ferramenta(s)]' || content.includes('[Usou')) {
        if (msg.parts) {
          try {
            const parts =
              typeof msg.parts === 'string' ? JSON.parse(msg.parts) : msg.parts

            if (Array.isArray(parts)) {
              const toolInvocations = parts.filter(
                (part: unknown) =>
                  typeof part === 'object' &&
                  part !== null &&
                  'type' in part &&
                  part.type === 'tool-invocation',
              )

              if (toolInvocations.length > 0) {
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

      return {
        role,
        content: content || '[Mensagem vazia]',
      }
    })
    .filter(
      (msg): msg is InputMessage =>
        msg.role === 'user' || msg.role === 'assistant',
    )
}

export function validateMessages(messages: Message[]): boolean {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false
  }

  const hasSystemMessage = messages.some((msg) => msg.role === 'system')
  if (!hasSystemMessage) {
    return false
  }

  return messages.every((msg) => {
    if (msg.role === 'system') return true
    return msg.content && msg.content.trim().length > 0
  })
}

export function removeDuplicateMessages(
  messages: InputMessage[],
): InputMessage[] {
  if (messages.length <= 1) return messages

  const uniqueMessages: InputMessage[] = []
  const seenMessages = new Set<string>()

  for (const message of messages) {
    const messageKey = `${message.role}:${message.content}`

    if (!seenMessages.has(messageKey)) {
      uniqueMessages.push(message)
      seenMessages.add(messageKey)
    }
  }

  return uniqueMessages
}

export function processToolInvocations(
  messages: InputMessage[],
): InputMessage[] {
  const uniqueMessages = messages.filter((message, index) => {
    if (index === 0) return true

    if (message.role === 'user') return true

    const prevMessage = messages[index - 1]
    return !(
      message.role === prevMessage.role &&
      message.content === prevMessage.content
    )
  })

  return uniqueMessages.map((message, index) => {
    if (
      message.role === 'assistant' &&
      (message.content.includes('tool-invocation') ||
        message.content.includes('getWeather') ||
        message.content.includes('[Consulta'))
    ) {
      const hasResultAfter = uniqueMessages
        .slice(index + 1)
        .some(
          (msg) =>
            msg.role === 'assistant' && msg.content.includes('já obtidos'),
        )

      if (hasResultAfter) {
        return {
          ...message,
          content: '[Consulta anterior já processada]',
        }
      }
    }

    return message
  })
}
