/* eslint-disable */

/**
 * Sistema simples de logging para o assistente virtual
 */

export interface LogData {
  type: 'request' | 'response' | 'error'
  timestamp: string
  data: any
  userId?: string
  sessionId?: string
}

/**
 * Registra informações sobre as interações do chat
 */
export function logChatInteraction(
  type: 'request' | 'response' | 'error',
  data: any,
  userId?: string,
  sessionId?: string,
): void {
  const logEntry: LogData = {
    type,
    timestamp: new Date().toISOString(),
    data,
    userId,
    sessionId,
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Chat ${type.toUpperCase()}]`,
      JSON.stringify(logEntry, null, 2),
    )
  }

  // Aqui você poderia adicionar lógica para enviar logs para
  // um serviço externo como CloudWatch, Datadog, etc.
}

/**
 * Registra erros específicos do chat
 */
export function logChatError(
  error: Error | unknown,
  context: Record<string, any> = {},
): void {
  const errorData =
    error instanceof Error
      ? {
        message: error.message,
        stack: error.stack,
        ...context,
      }
      : { error, ...context }

  logChatInteraction('error', errorData)
}
