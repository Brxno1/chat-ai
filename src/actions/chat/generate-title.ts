import { type Message } from 'ai'

import { generateChatTitleWIthAI } from '@/app/api/chat/services/generate-chat-title'
import { prisma } from '@/services/database/prisma'

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
