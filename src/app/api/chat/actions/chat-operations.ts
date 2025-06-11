'use server'

import { Chat } from '@prisma/client'

import { prisma } from '@/services/database/prisma'

import { errorHandler } from '../route'

type Role = 'user' | 'assistant'

type OperationResponse<T = Chat | null> = {
  data: T
  error?: string
  success: boolean
}

async function findOrCreateChat(
  userId?: string,
  chatId?: string,
  messages?: Array<{ role: Role; content: string }>,
): Promise<OperationResponse<Chat | null>> {
  try {
    if (chatId) {
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      return { success: true, data: chat }
    }

    if (userId && messages?.length) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((msg) => msg.role === 'user')

      const title = lastUserMessage
        ? lastUserMessage.content.substring(0, 50)
        : 'Nova conversa'

      const chat = await prisma.chat.create({
        data: {
          title,
          user: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      return { success: true, data: chat }
    }

    return { success: false, data: null }
  } catch (error) {
    return {
      success: false,
      error: errorHandler(error),
      data: null,
    }
  }
}

async function saveMessages(
  messages: Array<{ role: Role; content: string }>,
  chatId: string,
): Promise<OperationResponse<null>> {
  try {
    for (const msg of messages) {
      const existingMessage = await prisma.message.findFirst({
        where: {
          chatId,
          content: msg.content,
          role: msg.role === 'user' ? 'USER' : 'ASSISTANT',
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (!existingMessage) {
        await prisma.message.create({
          data: {
            content: msg.content,
            role: msg.role === 'user' ? 'USER' : 'ASSISTANT',
            chatId,
          },
        })
      }
    }

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: errorHandler(error),
      data: null,
    }
  }
}

async function saveChatResponse(
  result: { text: Promise<string> },
  chatId: string,
  originalChatId?: string,
  messages?: Array<{ role: Role; content: string }>,
): Promise<OperationResponse<null>> {
  if (!chatId)
    return { success: false, error: 'ID do chat não fornecido', data: null }

  result.text
    .then(async (fullText) => {
      try {
        await prisma.$transaction(async (tx) => {
          const existingMessage = await tx.message.findFirst({
            where: { chatId, role: 'ASSISTANT', content: fullText },
            orderBy: { createdAt: 'desc' },
          })

          if (!existingMessage) {
            await tx.message.create({
              data: { content: fullText, role: 'ASSISTANT', chatId },
            })

            if (!originalChatId && messages?.length) {
              const userMessages = messages
                .filter((msg) => msg.role === 'user')
                .map((msg) => msg.content)

              if (userMessages.length) {
                const title = userMessages[0].substring(0, 50)
                await tx.chat.update({
                  where: { id: chatId },
                  data: { title },
                })
              }
            }
          }
        })
      } catch (error) {
        console.error('Erro ao salvar resposta:', error)
      }
    })
    .catch((error) => console.error('Erro ao processar texto:', error))

  return { success: true, data: null }
}

export { findOrCreateChat, saveMessages, saveChatResponse }
