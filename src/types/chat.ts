import { Prisma } from '@prisma/client'
import { UIMessage } from 'ai'

import { MessageRole } from '@/services/database/generated'

export type ChatMessage = {
  id: string
  createdAt: Date
  content: string
  role: UIMessage['role']
  userId: string | null
  chatId: string
  parts?: UIMessage['parts']
}

export type DbMessage = {
  id: string
  createdAt: Date
  userId: string | null
  role: MessageRole
  chatId: string
  parts: Prisma.JsonValue
}
