import { type UIMessage } from 'ai'

import { generateChatTitleWithAI } from '@/app/api/chat/services/generate-chat-title'
import { prisma } from '@/services/database/prisma'

export async function updateChatTitle(
  finalChatId: string,
  finalMessages: UIMessage[],
) {
  try {
    const messageCount = await prisma.message.count({
      where: { chatId: finalChatId },
    })
    const shouldGenerate =
      messageCount === 2 ||
      messageCount === 4 ||
      (messageCount > 4 && (messageCount - 4) % 6 === 0)

    if (shouldGenerate) {
      const { title } = await generateChatTitleWithAI(finalMessages)

      await prisma.chat.update({
        where: { id: finalChatId },
        data: { title },
      })
    }
  } catch (error) {
    console.error('Failed to update chat title asynchronously:', error)
  }
}
