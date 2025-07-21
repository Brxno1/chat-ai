export type NewsArticle = {
  title: string
  description: string
  url: string
  publishedAt: string
  source: {
    name: string
  }
}

export type NewsToolResponse = {
  articles: NewsArticle[]
  error?: {
    title: string
    message: string
    topic: string
    code: 'NOT_FOUND' | 'API_ERROR' | 'NETWORK_ERROR'
  }
}

export type NewsErrorResponse = {
  error: {
    title: string
    message: string
    topic: string
    code: 'NOT_FOUND' | 'API_ERROR' | 'NETWORK_ERROR'
  }
}

export type NewsApiArticle = {
  title: string | null
  description?: string | null
  url: string
  publishedAt: string
  urlToImage?: string | null
  author?: string | null
  content?: string | null
  source?: {
    id?: string | null
    name?: string | null
  }
}

export interface NewsApiErrorResponse {
  status: 'error'
  code?: string
  message: string
}

export interface NewsApiSuccessResponse {
  status: 'ok'
  totalResults: number
  articles: NewsApiArticle[]
}

export type NewsApiResponse = NewsApiSuccessResponse | NewsApiErrorResponse
