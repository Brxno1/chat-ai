import type { MessagePart } from '@/types/chat'

type ToolArgs = {
  getWeather: { location: string }
  getNews: { topic: string }
  default: Record<string, never>
}

type ToolSummary<T extends keyof ToolArgs> = (args: ToolArgs[T]) => string

type ToolSummaries = {
  [K in keyof ToolArgs]: ToolSummary<K>
}

const toolSummaries: ToolSummaries = {
  getWeather: (args: ToolArgs['getWeather']) =>
    `[Consulta de previsão do tempo para ${args.location}]`,
  getNews: (args: ToolArgs['getNews']) =>
    `[Consulta de notícias para ${args.topic}]`,
  default: () => `[Consulta de informações com ferramentas`,
}

export function extractTextFromParts(parts: MessagePart[] | undefined): string {
  if (!parts) {
    return ''
  }

  const textFromParts = parts
    .filter(
      (part): part is Extract<MessagePart, { type: 'text' }> =>
        part.type === 'text',
    )
    .map((part) => part.text)
    .join(' ')

  if (textFromParts) {
    return textFromParts
  }

  const toolParts = parts.filter(
    (part): part is Extract<MessagePart, { type: 'tool-call' }> =>
      part.type === 'tool-call',
  )

  if (toolParts.length > 0) {
    return toolParts
      .map((part) => {
        const { toolName, args } = part

        switch (toolName) {
          case 'getWeather':
            return toolSummaries.getWeather(args as ToolArgs['getWeather'])
          case 'getNews':
            return toolSummaries.getNews(args as ToolArgs['getNews'])
          default:
            return toolSummaries.default({})
        }
      })
      .join(' ')
  }

  return ''
}
