/* eslint-disable @typescript-eslint/no-explicit-any */

import { Message, StreamTextResult } from 'ai'

import { generateSystemPrompt } from '../prompts'
import { errorHandler } from '../route'
import { weatherTool } from '../tools/weather'
import {
  convertDatabaseMessagesToAI,
  filterValidMessages,
  validateMessages,
} from '../utils/message-filter'
import {
  findOrCreateChat,
  saveChatResponse,
  saveMessages,
} from './chat-operations'
import { createStreamText } from './create-stream-text'

type Role = 'user' | 'assistant'

type ProcessChatAndSaveMessagesParams = {
  messages: Array<{ role: Role; content: string }>
  name?: string
  chatId?: string
  isGhostChatMode?: boolean
  userId?: string
  model?: string
}

type AllTools = {
  getWeather: typeof weatherTool
}

type ProcessChatAndSaveMessagesResponse = {
  stream: StreamTextResult<AllTools, never> | null
  chatId?: string
  error?: string
}

export async function processChatAndSaveMessages({
  messages,
  name,
  chatId,
  userId,
  isGhostChatMode,
}: ProcessChatAndSaveMessagesParams): Promise<ProcessChatAndSaveMessagesResponse> {
  console.log('🔥 === PROCESSAMENTO INICIADO ===')
  console.log('isGhostChatMode:', isGhostChatMode)
  console.log('userId:', userId)
  console.log('chatId:', chatId)
  console.log('messages:', messages.length)

  // Se está em modo fantasma, processa diretamente sem salvar
  if (isGhostChatMode) {
    console.log('👻 === MODO FANTASMA ATIVO ===')

    const finalMessages: Message[] = [
      {
        id: 'system',
        role: 'system',
        content: generateSystemPrompt({
          name: name || '',
          isLoggedIn: !!userId,
        }),
      },
      ...messages.map((message, index) => ({
        id: `message-${index}`,
        role: message.role,
        content: message.content,
      })),
    ]

    const { stream, error } = await createStreamText({
      messages: finalMessages,
    })

    return {
      stream,
      error: error || undefined,
      chatId: undefined,
    }
  }

  // Se não tem userId, também processa sem salvar
  if (!userId) {
    console.log('❌ === SEM USERID ===')

    const finalMessages: Message[] = [
      {
        id: 'system',
        role: 'system',
        content: generateSystemPrompt({
          name: name || '',
          isLoggedIn: !!userId,
        }),
      },
      ...messages.map((message, index) => ({
        id: `message-${index}`,
        role: message.role,
        content: message.content,
      })),
    ]

    const { stream, error } = await createStreamText({
      messages: finalMessages,
    })

    return {
      stream,
      error: error || undefined,
      chatId: undefined,
    }
  }

  console.log('💾 === PROCESSANDO COM BANCO ===')

  // Buscar ou criar chat
  const chatResponse = await findOrCreateChat(userId, chatId, messages)

  console.log('🗃️ Chat response:', {
    success: chatResponse.success,
    error: chatResponse.error,
    hasData: !!chatResponse.data,
  })

  if (!chatResponse.success) {
    console.log('❌ === ERRO AO BUSCAR/CRIAR CHAT ===', chatResponse.error)
    return {
      stream: null,
      error: chatResponse.error || 'Failed to create chat',
    }
  }

  const chat = chatResponse.data

  // Filtrar mensagens válidas da requisição
  const validRequestMessages = filterValidMessages(messages)
  console.log(
    '📝 Mensagens válidas da requisição:',
    validRequestMessages.length,
  )

  let finalMessages: Message[]
  let newUserMessages: Array<{ role: Role; content: string }> = []

  // Se o chat tem um ID (existe no banco), carregar mensagens existentes
  if (chatId && chat?.messages) {
    console.log('🔄 === CHAT EXISTENTE - CARREGANDO MENSAGENS ===')
    console.log('Mensagens no banco:', chat.messages.length)

    // Converter mensagens do banco para formato AI
    const dbMessages = convertDatabaseMessagesToAI(chat.messages)
    console.log('Mensagens convertidas do banco:', dbMessages.length)

    // Encontrar mensagens novas comparando com o banco
    const lastDbUserMessage = [...dbMessages]
      .reverse()
      .find((msg) => msg.role === 'user')

    console.log(
      'Última mensagem do usuário no banco:',
      lastDbUserMessage?.content?.substring(0, 50) + '...',
    )

    // Se não há mensagem do usuário no banco, todas são novas
    if (!lastDbUserMessage) {
      newUserMessages = validRequestMessages.filter(
        (msg) => msg.role === 'user',
      )
      console.log(
        'Nenhuma mensagem no banco - todas são novas:',
        newUserMessages.length,
      )
    } else {
      // Encontrar índice da última mensagem conhecida
      const lastKnownIndex = validRequestMessages.findIndex(
        (msg) =>
          msg.role === 'user' && msg.content === lastDbUserMessage.content,
      )

      if (lastKnownIndex >= 0) {
        // Pegar apenas mensagens depois da última conhecida
        newUserMessages = validRequestMessages
          .slice(lastKnownIndex + 1)
          .filter((msg) => msg.role === 'user')
        console.log('Mensagens novas encontradas:', newUserMessages.length)
      } else {
        // Se não encontrou a última mensagem, considerar apenas a última da requisição como nova
        const lastRequestUserMessage = [...validRequestMessages]
          .reverse()
          .find((msg) => msg.role === 'user')

        if (
          lastRequestUserMessage &&
          lastRequestUserMessage.content !== lastDbUserMessage.content
        ) {
          newUserMessages = [lastRequestUserMessage]
          console.log(
            'Usando apenas última mensagem como nova:',
            newUserMessages.length,
          )
        } else {
          newUserMessages = []
          console.log('Nenhuma mensagem nova detectada')
        }
      }
    }

    // Se não há mensagens novas, retornar erro
    if (newUserMessages.length === 0) {
      console.log('❌ === NENHUMA MENSAGEM NOVA ===')
      return {
        stream: null,
        error: 'Nenhuma mensagem nova para processar',
      }
    }

    // Combinar mensagens do banco + novas mensagens
    const allMessages = [...dbMessages, ...newUserMessages]
    console.log('Total de mensagens para processar:', allMessages.length)

    finalMessages = [
      {
        id: 'system',
        role: 'system',
        content: generateSystemPrompt({
          name: name || '',
          isLoggedIn: !!userId,
        }),
      },
      ...allMessages.map((message, index) => ({
        id: `message-${index}`,
        role: message.role,
        content: message.content,
      })),
    ]
  } else {
    console.log('🆕 === CHAT NOVO ===')
    // Chat novo - processar todas as mensagens
    newUserMessages = validRequestMessages.filter((msg) => msg.role === 'user')

    finalMessages = [
      {
        id: 'system',
        role: 'system',
        content: generateSystemPrompt({
          name: name || '',
          isLoggedIn: !!userId,
        }),
      },
      ...validRequestMessages.map((message, index) => ({
        id: `message-${index}`,
        role: message.role,
        content: message.content,
      })),
    ]
  }

  console.log('📝 finalMessages criadas:', finalMessages.length)

  // Validar mensagens antes de prosseguir
  const isValid = validateMessages(finalMessages)
  console.log('✅ Mensagens válidas:', isValid)

  if (!isValid) {
    console.log('❌ === MENSAGENS INVÁLIDAS ===')
    return {
      stream: null,
      error: 'Mensagens inválidas ou vazias',
    }
  }

  // Criar stream
  console.log('🚀 === CRIANDO STREAM ===')
  const { stream, error } = await createStreamText({
    messages: finalMessages,
  })

  if (error) {
    console.log('❌ === ERRO AO CRIAR STREAM ===', error)
    return {
      stream: null,
      error: errorHandler(error),
    }
  }

  console.log('💾 Mensagens do usuário para salvar:', newUserMessages.length)

  // Salvar apenas as mensagens novas do usuário
  if (newUserMessages.length > 0) {
    await saveMessages(newUserMessages, chat!.id)
  }

  // Salvar resposta em background sem bloquear o retorno do stream
  saveChatResponse(stream!, chat!.id, chatId, newUserMessages).catch(
    (error) => {
      console.error('Error saving response:', error)
    },
  )

  console.log('✅ === PROCESSAMENTO FINALIZADO ===')
  return {
    stream,
    chatId: chat!.id,
  }
}
