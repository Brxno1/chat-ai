import { type Message } from 'ai'

import { prisma } from '@/services/database/prisma'

import { generateChatTitleWIthAI } from '../services/generate-chat-title'

export async function generateTitle(
  finalChatId: string,
  finalMessages: Message[],
) {
  try {
    const messageCount = await prisma.message.count({
      where: { chatId: finalChatId },
    })
    if (messageCount % 3 === 0) {
      const { title } = await generateChatTitleWIthAI(finalMessages)

      await prisma.chat.update({
        where: { id: finalChatId },
        data: { title },
      })
    }
  } catch (error) {
    console.error('Failed to update chat title asynchronously:', error)
  }
}
