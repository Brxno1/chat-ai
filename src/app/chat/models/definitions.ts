type Model = {
  id: string
  name: string
  provider: string
  disabled: boolean
  description?: string
}

export const models: Model[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google.com',
    disabled: false,
  },
  {
    id: 'gemini-1.5-flash-002',
    name: 'Gemini 1.5 Flash 002',
    provider: 'google.com',
    disabled: false,
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'google.com',
    disabled: false,
  },
  {
    id: 'gemini-1.5-flash-8b-latest',
    name: 'Gemini 1.5 Flash 8B Latest',
    provider: 'google.com',
    disabled: false,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google.com',
    disabled: false,
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Exp',
    provider: 'google.com',
    disabled: false,
  },
  {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking Exp',
    provider: 'google.com',
    disabled: false,
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google.com',
    disabled: false,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai.com',
    disabled: true,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai.com',
    disabled: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai.com',
    disabled: true,
  },
  {
    id: 'claude-2',
    name: 'Claude 2',
    provider: 'anthropic.com',
    disabled: true,
  },
  {
    id: 'claude-instant',
    name: 'Claude Instant',
    provider: 'anthropic.com',
    disabled: true,
  },
  {
    id: 'llama-2-70b',
    name: 'Llama 2 70B',
    provider: 'meta.com',
    disabled: true,
  },
  {
    id: 'llama-2-13b',
    name: 'Llama 2 13B',
    provider: 'meta.com',
    disabled: true,
  },
  {
    id: 'cohere-command',
    name: 'Command',
    provider: 'cohere.com',
    disabled: true,
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    provider: 'mistral.ai',
    disabled: true,
  },
]
