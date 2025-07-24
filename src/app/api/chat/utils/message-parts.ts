import { MessagePart } from '@/types/chat'

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
    .filter((part) => part && part.type === 'text' && part.text)
    .map((part) => part.text)
    .join(' ')

  if (textFromParts) {
    return textFromParts
  }

  const toolInvocationParts = parts.filter(
    (part) => part.type === 'tool-invocation',
  )

  if (toolInvocationParts.length > 0) {
    return toolInvocationParts
      .map((part) => {
        const { toolName } = part.toolInvocation!

        switch (toolName) {
          case 'getWeather':
            return toolSummaries.getWeather[toolName](
              part.toolInvocation!.args as ToolArgs['getWeather'],
            )
          case 'getNews':
            return toolSummaries.getNews[toolName](
              part.toolInvocation!.args as ToolArgs['getNews'],
            )
          default:
            return toolSummaries.default({})
        }
      })
      .join(' ')
  }

  return ''
}
