'use server'

import { GoogleGenAI } from '@google/genai'
import { type Message } from 'ai'

import { env } from '@/lib/env'

import { systemInstructionQuestionSuggestions } from '../utils/system-Instruction'

const genAI = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY_GENERATE,
})

const model = 'gemini-2.5-flash'

export async function suggestQuestions(messages: Message[]) {
  try {
    const response = await genAI.models.generateContent({
      model,
      contents: messages.map((message) => ({
        text: message.content,
      })),
      config: {
        responseMimeType: 'text/plain',
        systemInstruction: systemInstructionQuestionSuggestions,
      },
    })

    const text = response.text || ''
    const questions = text
      .split('\n')
      .filter((q) => q.trim())
      .slice(0, 3)

    return questions.map((question, index) => ({
      id: `suggestion-${index}`,
      role: 'assistant' as const,
      content: question.trim(),
    }))
  } catch (error) {
    throw new Error('Failed to generate question suggestions')
  }
}
