import { MessagePart } from '@/types/chat'

const toolSummaries = {
  getWeather: (args: { location: string }) =>
    `[Consulta de previsão do tempo para ${args.location}]`,
  getNews: (args: { topic: string }) =>
    `[Consulta de notícias para ${args.topic}]`,
}

const defaultToolSummary = '[Consulta de informações com ferramentas]'

export function extractTextFromParts(parts: MessagePart[] | undefined): string {
  if (!parts || !Array.isArray(parts) || parts.length === 0) {
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
    (part) => part && part.type === 'tool-invocation' && part.toolInvocation,
  )

  if (toolInvocationParts.length > 0) {
    return toolInvocationParts
      .map((part) => {
        const { toolName } = part.toolInvocation!

        switch (toolName) {
          case 'getWeather':
            return toolSummaries[toolName](
              part.toolInvocation!.args as { location: string },
            )
          case 'getNews':
            return toolSummaries[toolName](
              part.toolInvocation!.args as { topic: string },
            )
          default:
            return defaultToolSummary
        }
      })
      .join(' ')
  }

  return ''
}
