export interface ChatConfig {
  modelName: string
  temperature: number
  maxTokens?: number
  timeoutSeconds: number
}

export const chatConfig: ChatConfig = {
  modelName: 'gemini-1.5-flash-001',
  temperature: 0.6,
  maxTokens: 1000,
  timeoutSeconds: 60,
}

export const defaultErrorMessage =
  'Olá! Estou tendo problemas técnicos no momento. Poderia tentar novamente mais tarde?'
