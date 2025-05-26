import { openai } from '@ai-sdk/openai'
import { Message, streamText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/lib/env'
import { auth } from '@/services/auth'

import {
  getOrCreateChat,
  saveMessages,
  saveResponseWhenComplete,
} from './actions/chat-operations'
import { setAiModelCookie } from './actions/set-ai-model-cookie'
import { chatConfig, defaultErrorMessage } from './config'
import { logChatError } from './logger'
import { generateSystemPrompt } from './prompts'

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
  name: z.string(),
  locale: z.string(),
  chatId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    console.log('Recebendo requisição de chat...')

    let requestData
    try {
      requestData = await req.json()
      console.log('Dados da requisição:', JSON.stringify(requestData))
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    let validatedData
    try {
      validatedData = schema.parse(requestData)
    } catch (validationError) {
      console.error('Erro de validação:', validationError)
      return NextResponse.json(
        { error: 'Validation failed', details: validationError },
        { status: 400 },
      )
    }

    const { messages, name, locale, chatId } = validatedData
    console.log(
      `Mensagens recebidas: ${messages.length}, chatId: ${chatId || 'novo'}`,
    )

    let session
    try {
      session = await auth()
    } catch (authError) {
      console.error('Erro de autenticação:', authError)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 },
      )
    }

    const userId = session?.user?.id
    console.log(`Usuário autenticado: ${userId ? 'Sim' : 'Não'}`)

    let chat
    try {
      chat = await getOrCreateChat(userId, chatId, messages)
      console.log(`Chat: ${chat?.id || 'não criado'}`)
    } catch (dbError) {
      console.error('Erro no banco de dados:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não configurada')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      )
    }

    let model
    try {
      model = (await setAiModelCookie()) || chatConfig.modelName
      console.log(`Usando modelo: ${model}`)
    } catch (modelError) {
      console.error('Erro ao configurar modelo:', modelError)
      return NextResponse.json(
        { error: 'Model configuration error' },
        { status: 500 },
      )
    }

    const promptMessages: Message[] = [
      {
        id: 'system',
        role: 'system',
        content: generateSystemPrompt(name, locale),
      } as Message,
      ...(messages.map((msg, i) => ({
        id: `msg-${i}`,
        ...msg,
      })) as Message[]),
    ]

    console.log('Enviando requisição para a OpenAI...')

    let result
    try {
      result = streamText({
        model: openai(model),
        temperature: chatConfig.temperature,
        maxTokens: chatConfig.maxTokens,
        messages: promptMessages,
      })
    } catch (aiError) {
      console.error('Erro na API da OpenAI:', aiError)
      return NextResponse.json(
        { error: 'AI service error', details: aiError },
        { status: 500 },
      )
    }

    if (userId && chat) {
      try {
        await saveMessages(messages, chat.id)
        saveResponseWhenComplete(result, chat.id, chatId, messages)
        console.log('Mensagens salvas no banco de dados')
      } catch (saveError) {
        console.error('Erro ao salvar mensagens:', saveError)
      }
    }

    console.log('Enviando resposta de streaming...')
    try {
      const response = result.toDataStreamResponse()
      if (chat?.id) {
        response.headers.set('X-Chat-Id', chat.id)
      }
      return response
    } catch (streamError) {
      console.error('Erro ao criar stream de resposta:', streamError)
      return NextResponse.json({ error: 'Streaming error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro geral na API de chat:', error)
    logChatError(error)
    return NextResponse.json(
      { error: 'Internal server error', message: defaultErrorMessage },
      { status: 500 },
    )
  }
}
