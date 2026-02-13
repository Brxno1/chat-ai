import { type StreamTextResult, type UIMessage } from 'ai'

import { newsTool } from '@/app/api/chat/tools/news'
import { weatherTool } from '@/app/api/chat/tools/weather'
import type { MessageRole, Prisma } from '@/services/database/generated'

export type AllTools = {
  getWeather: typeof weatherTool
  getNews: typeof newsTool
}

export type StreamResult = StreamTextResult<AllTools, never>

export type ChatMessage = {
  id: string
  createdAt: Date
  role: UIMessage['role']
  userId: string | null
  chatId: string
  parts: UIMessage['parts']
  attachments?: {
    name: string
    contentType: string
    url: string
  }[]
}

export type DbMessage = {
  id: string
  createdAt: Date
  userId: string | null
  role: MessageRole
  chatId: string
  parts: Prisma.JsonValue
  attachments?: {
    name: string
    contentType: string
    url: string
  }[]
}

export type MessagePart = {
  type: 'text' | 'tool-invocation' | 'reasoning' | 'source' | 'file'
  text?: string
  reasoning?: string
  details?: unknown[]
  mediaType?: string
  filename?: string
  url?: string
  toolInvocation?: {
    toolCallId: string
    toolName: 'getWeather' | 'getNews'
    args: Record<string, unknown>
    state: 'call' | 'result'
    callTimestamp: number
    resultTimestamp?: number
    result?: unknown | unknown[] | null
  }
}

export type ToolResult = {
  toolCallId: string
  toolName: 'getWeather' | 'getNews'
  result: unknown
  args: Record<string, unknown>
}

export type ProcessChatAndSaveMessagesProps = {
  messages: UIMessage[]
  userName?: string
  headerChatId?: string
  isGhostChatMode?: boolean
  userId?: string
  modelId: string
}

export type ProcessChatAndSaveMessagesResponse = {
  stream: StreamResult | null
  headerChatId?: string
  error?: string
}
