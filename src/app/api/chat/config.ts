export interface ChatConfig {
  modelName: string
  temperature: number
  maxTokens?: number
  timeoutSeconds: number
}

export const chatConfig: ChatConfig = {
  modelName: 'gpt-4o-mini',
  temperature: 0.5,
  maxTokens: 500,
  timeoutSeconds: 60,
}

export const defaultErrorMessage =
  'Olá! Estou tendo problemas técnicos no momento. Poderia tentar novamente mais tarde?'
