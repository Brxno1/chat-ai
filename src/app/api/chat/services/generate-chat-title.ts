import { GoogleGenAI } from '@google/genai'
import { type UIMessage } from 'ai'

import { env } from '@/lib/env'

import { extractTextFromMessage } from '../utils/message-processor'
import { systemInstructionTitleGeneration } from '../utils/system-Instruction'

const genAI = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY_GENERATE_TITLE,
})

const model = 'gemini-2.5-flash-lite'

function getFallbackTitle(messages: UIMessage[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === 'user')
  if (!firstUserMessage) return 'Nova conversa'
  return extractTextFromMessage(firstUserMessage).substring(0, 50)
}

function sanitizeTitle(raw: string): string {
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\n/g, ' ')
    .substring(0, 100)
}

export async function generateChatTitleWithAI(
  messages: UIMessage[],
): Promise<{ title: string }> {
  try {
    const conversationLog = messages
      .map((msg) => {
        const role = msg.role === 'user' ? 'Usuário' : 'Assistente'
        const text = extractTextFromMessage(msg)
        const truncatedText =
          text.length > 300 ? text.substring(0, 300) + '...' : text
        return `${role}: ${truncatedText}`
      })
      .join('\n\n')
      .substring(0, 2000)

    const response = await genAI.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: conversationLog }],
        },
      ],
      config: {
        maxOutputTokens: 50,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstructionTitleGeneration }],
        },
      },
    })

    if (response.text) {
      return { title: sanitizeTitle(response.text) }
    }

    return { title: getFallbackTitle(messages) }
  } catch (error) {
    console.error('Erro na API do Gemini para geração de título:', error)
    return { title: getFallbackTitle(messages) }
  }
}
