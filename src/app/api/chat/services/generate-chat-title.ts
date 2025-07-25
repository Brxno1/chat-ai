import { Message } from '@ai-sdk/react'
import { GoogleGenAI } from '@google/genai'

import { env } from '@/lib/env'

import { extractTextFromMessage } from '../utils/message-processor'
import { systemInstructionTitleGeneration } from '../utils/system-Instruction'

const genAI = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY_GENERATE,
})

const model = 'gemini-1.5-flash'

export async function generateChatTitle(
  messages: Message[],
): Promise<{ title: string }> {
  try {
    const firstUserMessage = messages.find((msg) => msg.role === 'user')
    const fallbackTitle = firstUserMessage
      ? extractTextFromMessage(firstUserMessage)
      : 'Nova conversa'

    const conversationContext = messages
      .map((msg) => {
        const role = msg.role === 'user' ? 'Usuário' : 'Assistente'
        const text = extractTextFromMessage(msg)
        const truncatedText =
          text.length > 300 ? text.substring(0, 300) + '...' : text
        return `${role}: ${truncatedText}`
      })
      .join('\n\n')
      .substring(0, 2000)

    const prompt = `
Analise esta conversa e crie um título específico e descritivo em pt-BR:

${conversationContext}

O título deve:
1. Capturar o tema específico da conversa
2. Ser único e informativo
3. NÃO usar termos genéricos
4. Focar no assunto específico discutido
`

    const response = await genAI.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        maxOutputTokens: 30,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstructionTitleGeneration }],
        },
      },
    })

    if (response.text) {
      return { title: response.text }
    }

    return { title: fallbackTitle }
  } catch (apiError) {
    console.error('Erro na API do Gemini para geração de título:', apiError)

    const firstUserMessage = messages.find((msg) => msg.role === 'user')
    const fallbackTitle = firstUserMessage
      ? extractTextFromMessage(firstUserMessage).substring(0, 50)
      : 'Novo Chat'

    return { title: fallbackTitle }
  }
}
