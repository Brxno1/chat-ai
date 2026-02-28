import {
  type StepResult,
  type StreamTextResult,
  type ToolSet,
  type UIMessage,
} from 'ai'

import { newsTool } from '@/app/api/chat/tools/news'
import { weatherTool } from '@/app/api/chat/tools/weather'
import type { MessageRole, Prisma } from '@/services/database/generated'

export type MessagePart = NonNullable<UIMessage['parts']>[number]

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
}

export type DbMessage = {
  id: string
  createdAt: Date
  userId: string | null
  role: MessageRole
  chatId: string
  parts: Prisma.JsonValue
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

export type SystemPrompt = {
  name: string
  isLoggedIn: boolean
}

export type ChatStreamStatus =
  | 'thinking'
  | 'responding'
  | 'streaming'
  | 'submitted'
  | 'ready'
  | 'error'

export type StoragePart = Extract<
  UIMessage['parts'][number],
  { type: 'text' | 'file' }
>

export type ChatResponsePayload = {
  content: StepResult<ToolSet>['content']
  chatId: string
  userId: string
}

export interface ChatAttachment {
  name: string
  contentType: string
  url: string
}

export type ProcessedAttachment = {
  url: string
  name: string
  contentType: string
}

export type FilePart = Extract<UIMessage['parts'][number], { type: 'file' }>

export type UploadedAttachment = {
  url: string
  name: string
  contentType: string
}
