import { prisma } from '@/services/database/prisma'

type Role = 'user' | 'assistant'

export async function getOrCreateChat(
  userId?: string,
  chatId?: string,
  messages?: Array<{ role: Role; content: string }>,
) {
  if (!userId) return null

  if (chatId) {
    return prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    })
  }

  if (userId && messages?.length) {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'user')
    const title = lastUserMessage
      ? lastUserMessage.content.substring(0, 50)
      : 'Nova conversa'

    return prisma.chat.create({
      data: {
        title,
        userId,
      },
    })
  }

  return null
}

export async function saveMessages(
  messages: Array<{ role: Role; content: string }>,
  chatId: string,
) {
  return Promise.all(
    messages.map((message) =>
      prisma.message.create({
        data: {
          content: message.content,
          role: message.role === 'user' ? 'USER' : 'ASSISTANT',
          chatId,
        },
      }),
    ),
  )
}

export function saveResponseWhenComplete(
  result: { text: Promise<string> },
  chatId: string,
  originalChatId?: string,
  messages?: Array<{ role: Role; content: string }>,
) {
  const responsePromise = new Promise<void>((resolve) => {
    result.text.then((fullText) => {
      prisma.message
        .create({
          data: {
            content: fullText,
            role: 'ASSISTANT',
            chatId,
          },
        })
        .then(() => {
          if (!originalChatId && messages?.length) {
            const userMessage =
              messages.find((msg) => msg.role === 'user')?.content || ''

            return prisma.chat.update({
              where: { id: chatId },
              data: {
                title: userMessage.substring(0, 50),
              },
            })
          }
        })
        .then(() => resolve())
        .catch((error) => {
          console.error('Erro ao salvar resposta do assistente:', error)
          resolve()
        })
    })
  })

  responsePromise.catch(console.error)
}
