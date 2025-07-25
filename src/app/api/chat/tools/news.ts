import { tool as createTool } from 'ai'
import { z } from 'zod'

import { api } from '@/lib/axios'
import type {
  NewsApiResponse,
  NewsErrorResponse,
  NewsToolResponse,
} from '@/types/news'

async function fetchNewsData(
  topic: string,
  limit: number = 3,
): Promise<NewsToolResponse[] | NewsErrorResponse> {
  try {
    const response = await api.get<NewsApiResponse>(
      `https://newsapi.org/v2/everything?q=${topic}&apiKey=${process.env.NEWSAPI_KEY}&language=pt&pageSize=${limit}`,
    )

    if (response.status !== 200) {
      return {
        error: {
          title: 'Erro na API',
          message: `Não foi possível obter notícias sobre "${topic}": Erro de conexão`,
          topic,
          code: 'API_ERROR',
        },
      }
    }

    if (!response.data.articles) {
      return {
        error: {
          title: 'Sem resultados',
          message: `Não foram encontradas notícias sobre "${topic}"`,
          topic,
          code: 'NOT_FOUND',
        },
      }
    }

    return response.data.articles.slice(0, limit).map((article) => ({
      title: article.title || 'Sem título',
      description: article.description || '',
      url: article.url,
      publishedAt: article.publishedAt,
      source: {
        name: article.source?.name || 'Fonte desconhecida',
      },
    }))
  } catch (error) {
    return {
      error: {
        title: 'Erro de conexão',
        message: `Não foi possível conectar ao serviço de notícias para obter dados sobre "${topic}"`,
        topic,
        code: 'NETWORK_ERROR',
      },
    }
  }
}

export const newsTool = createTool({
  description: 'Busca notícias recentes sobre um tópico específico',
  parameters: z.object({
    topic: z
      .string()
      .describe('O tópico ou assunto das notícias a serem buscadas'),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe('Número máximo de notícias a retornar'),
  }),
  execute: async function ({ topic, limit = 5 }) {
    if (!topic || topic.trim() === '') {
      return {
        error: {
          title: 'Tópico inválido',
          message:
            'Nenhum tópico válido foi fornecido para a busca de notícias.',
          topic: 'desconhecido',
          code: 'NOT_FOUND',
        },
      }
    }

    try {
      const result = await fetchNewsData(topic, limit)
      return result
    } catch (error) {
      return {
        error: {
          title: 'Serviço indisponível',
          message: `Não foi possível obter notícias sobre "${topic}". Por favor, tente novamente mais tarde.`,
          topic,
          code: 'API_ERROR',
        },
      }
    }
  },
})
