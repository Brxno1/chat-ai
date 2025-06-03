/* eslint-disable */

/**
 * Simple logging system for the virtual assistant
 */

export interface LogData {
  type: 'request' | 'response' | 'error'
  timestamp: string
  data: any
  userId?: string
  sessionId?: string
}

/**
 * Register information about chat interactions
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

  // A server side logging would be better here
}

/**
 * Register specific chat errors
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
