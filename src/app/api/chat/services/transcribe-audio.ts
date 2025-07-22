import { GoogleGenAI } from '@google/genai'

import { env } from '@/lib/env'

import { systemInstruction } from '../system-Instruction'

const genAI = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
})

const model = 'gemini-2.5-flash'

export async function transcribeAudioStream(
  audioAsBase64: string,
  mimeType: string,
) {
  try {
    const responseStream = await genAI.models.generateContentStream({
      model,
      contents: [
        {
          inlineData: {
            mimeType,
            data: audioAsBase64,
          },
        },
      ],
      config: {
        responseMimeType: 'text/plain',
        systemInstruction,
      },
    })

    return responseStream
  } catch (error) {
    throw new Error('Falha ao transcrever áudio')
  }
}
