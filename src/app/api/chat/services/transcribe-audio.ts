import { GoogleGenAI } from '@google/genai'

import { env } from '@/lib/env'

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const response = await gemini.models.generateContent({
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
      systemInstruction: `Você é um assistente de IA que transcreve áudio para texto.
    Transcreva o áudio para Português do Brasil.
    Seja preciso e natural na transcrição. Mantenha o áudio o mais fiel possível e use pontuação de forma adequada, quebrando em parágrafos quando necessário.
    Ignore e não transcreva sons que não sejam fala humana, como bipes, batidas, ruídos, música ou qualquer outro som que não seja claramente a voz do usuário. 
    Apenas transcreva o que for falado pelo usuário, sem mencionar sons ou ruídos no texto.`,
      thinkingConfig: {
        includeThoughts: true,
        thinkingBudget: 1024,
      },
    },
  })

  if (!response.text) {
    throw new Error('Failed to transcribe audio')
  }

  return {
    transcription: response.text,
  }
}
