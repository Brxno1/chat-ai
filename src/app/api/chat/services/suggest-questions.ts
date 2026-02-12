'use server'

import { GoogleGenAI } from '@google/genai'
import { type UIMessage } from 'ai'

import { env } from '@/lib/env'

import { systemInstructionQuestionSuggestions } from '../utils/system-Instruction'

const genAI = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY_GENERATE,
})

const model = 'gemini-2.5-flash'

function getTextFromParts(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
}

export async function suggestQuestions(message: UIMessage) {
  try {
    const messageText = getTextFromParts(message)
    const stream = await genAI.models.generateContentStream({
      model,
      contents: {
        text: messageText,
      },
      config: {
        responseMimeType: 'text/plain',
        systemInstruction: systemInstructionQuestionSuggestions,
      },
    })

    const questions: string[] = []

    for await (const chunk of stream) {
      if (chunk.text) {
        const formattedQuestion = chunk.text.split('\n').filter((q) => q.trim())

        questions.push(...formattedQuestion)
      }
    }

    return questions.map((question, index) => ({
      id: `suggestion-${index}`,
      role: 'assistant' as const,
      content: question.trim(),
    }))
  } catch (error) {
    throw new Error('Failed to generate question suggestions')
  }
}
