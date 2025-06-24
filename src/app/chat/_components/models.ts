type Model = {
  id: string
  name: string
  provider: string
  disabled: boolean
  description: string
}

export const models: Model[] = [
  {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking Exp',
    provider: 'google.com',
    disabled: false,
    description:
      'Modelo experimental Gemini 2.0 Flash Thinking, projetado para explorar novas abordagens em IA generativa.',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Exp',
    provider: 'google.com',
    disabled: false,
    description:
      'Modelo experimental Gemini 2.0 Flash, projetado para explorar novas abordagens em IA generativa.',
  },
  {
    id: 'gemini-1.5-flash-8b-latest',
    name: 'Gemini 1.5 Flash 8B Latest',
    provider: 'google.com',
    disabled: false,
    description:
      'Última versão do modelo Gemini 1.5 Flash 8B, com melhorias em eficiência e capacidade de resposta.',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google.com',
    disabled: false,
    description:
      'Modelo Gemini 2.0 Flash Lite da Google, ideal para tarefas de processamento de linguagem natural com alta precisão.',
  },
  {
    id: 'gemini-1.5-flash-001',
    name: 'Gemini 1.5 Flash 001',
    provider: 'google.com',
    disabled: false,
    description:
      'Modelo Gemini 1.5 Flash 001 da Google, ideal para tarefas de processamento de linguagem natural com alta precisão.',
  },
  {
    id: 'gemini-1.5-flash-002',
    name: 'Gemini 1.5 Flash 002',
    provider: 'google.com',
    disabled: false,
    description:
      'Modelo Gemini 1.5 Flash 002, otimizado para geração de texto e compreensão contextual.',
  },
  {
    id: 'palm-2',
    name: 'PaLM 2',
    provider: 'google.com',
    disabled: false,
    description:
      'Modelo PaLM 2 da Google, focado em tarefas complexas de raciocínio e compreensão de linguagem.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai.com',
    disabled: false,
    description:
      'Versão mini do modelo GPT-4o da OpenAI, excelente para aplicações que requerem respostas rápidas e precisas.',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai.com',
    disabled: true,
    description:
      'Modelo GPT-4 da OpenAI, conhecido por sua capacidade de gerar texto coerente e criativo.',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai.com',
    disabled: true,
    description:
      'Modelo GPT-3.5 Turbo, otimizado para velocidade e eficiência em tarefas de conversação.',
  },
  {
    id: 'claude-2',
    name: 'Claude 2',
    provider: 'anthropic.com',
    disabled: true,
    description:
      'Modelo Claude 2 da Anthropic, projetado para interações seguras e éticas em IA, com foco em compreensão de contexto.',
  },
  {
    id: 'claude-instant',
    name: 'Claude Instant',
    provider: 'anthropic.com',
    disabled: true,
    description:
      'Modelo Claude Instant da Anthropic, voltado para respostas rápidas e seguras.',
  },
  {
    id: 'llama-2-70b',
    name: 'Llama 2 70B',
    provider: 'meta.com',
    disabled: false,
    description:
      'Modelo Llama 2 70B da Meta, ideal para tarefas de geração de texto em larga escala e análise de dados.',
  },
  {
    id: 'llama-2-13b',
    name: 'Llama 2 13B',
    provider: 'meta.com',
    disabled: true,
    description:
      'Modelo Llama 2 13B da Meta, focado em aplicações de IA mais leves.',
  },
  {
    id: 'cohere-command',
    name: 'Command',
    provider: 'cohere.com',
    disabled: true,
    description:
      'Modelo Command da Cohere, projetado para tarefas de linguagem natural.',
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    provider: 'mistral.ai',
    disabled: false,
    description:
      'Modelo Mistral 7B da Mistral.ai, conhecido por sua eficiência em tarefas de geração de texto e análise de sentimentos.',
  },
]
