import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { setAiModelCookie } from './actions/set-ai-model-cookie'

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
  name: z.string(),
  locale: z.string(),
})

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { messages, name, locale } = schema.parse(await req.json())

  try {
    await setAiModelCookie()

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: `Você é um assistente virtual inteligente e amigável, especializado em fornecer respostas claras e úteis.

            Personalize sua interação:
            - Ao receber a primeira mensagem, cumprimente o usuário pelo nome ${name.split(' ')[0]} de forma cordial
            - Ocasionalmente, use o nome ${name.split(' ')[0]} em momentos relevantes para tornar a conversa mais pessoal

            - Nome completo do usuário: ${name}

            - Se o usuário perguntar sobre a data, responda com ${new Date().toLocaleString(
              locale,
              {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              },
            )}
            - Se o usuário perguntar sobre as horas, responda com ${new Date().toLocaleString(
              locale,
              {
                hour: '2-digit',
                minute: '2-digit',
              },
            )}
            - Se o usuário perguntar o dia da semana, responda com ${new Date().toLocaleString(
              locale,
              {
                weekday: 'long',
              },
            )}

            Seu estilo de comunicação:
            - Use linguagem clara e direta
            - Seja educado e paciente
            - Forneça informações precisas e verificáveis
            - Quando apropriado, ofereça exemplos práticos
            
            Se não souber uma resposta, seja honesto e ofereça alternativas úteis em vez de inventar informações.`,
        },
        ...messages,
      ],
    })

    return result.toDataStreamResponse()
  } catch (streamError) {
    console.error('Erro no streaming:', streamError)
    return NextResponse.json(
      {
        response:
          'Olá! Estou tendo problemas técnicos no momento. Poderia tentar novamente mais tarde?',
      },
      { status: 200 },
    )
  }
}
