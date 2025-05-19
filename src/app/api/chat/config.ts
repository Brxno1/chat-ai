export interface ChatConfig {
  modelName: string
  temperature: number
  maxTokens?: number
  timeoutSeconds: number
}

// Configurações do assistente virtual
export const chatConfig: ChatConfig = {
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
  timeoutSeconds: 30,
}

export const defaultErrorMessage =
  'Olá! Estou tendo problemas técnicos no momento. Poderia tentar novamente mais tarde?'
