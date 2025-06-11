/* eslint-disable */
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { Message, streamText } from 'ai'

import { chatConfig } from '../config'
import { countTodosTool } from './counter-todos-tool'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

type CreateStreamTextParams = {
  messages: Message[]
  userId?: string
}

export async function createStreamText({ messages, userId }: CreateStreamTextParams) {
  // Adicionamos a instrução de responder em português e formatação no prompt do sistema
  const systemPromptAdditional =
    `Você deve sempre responder em português de forma clara e natural.
     IMPORTANTE: NUNCA exiba código de programação (especialmente código Python) nas suas respostas.
     NUNCA mostre comandos como "python print(...)" ou similar em suas respostas.
     
     Nunca retorne objetos JSON brutos ou dados técnicos sem contextualização. 
     Quando receber resultados de ferramentas, formule uma resposta que integre naturalmente os dados.
     
     Ao exibir informações sobre tarefas (to-dos), simplesmente comunique os fatos sem mencionar ferramentas
     ou comandos técnicos. Por exemplo: "Você tem 66 tarefas no total, sendo 40 pendentes, 20 concluídas..."
     em vez de mostrar qualquer tipo de código.`

  // Modificamos o prompt do sistema se existir
  const enhancedMessages = messages.map(message => {
    if (message.role === 'system') {
      return {
        ...message,
        content: `${message.content}\n\n${systemPromptAdditional}`
      }
    }
    return message
  })

  const sanitizedMessages = enhancedMessages.map((message) => {
    if (Array.isArray(message.content)) {
      return {
        ...message,
        content: message.content
          .map((part) => {
            if (typeof part === 'string') return part
            if (part.type === 'text') return part.text
            return JSON.stringify(part)
          })
          .join(' '),
      }
    }
    return message
  })

  const stream = streamText({
    model: google('gemini-1.5-flash-8b-latest'),
    temperature: chatConfig.temperature,
    maxTokens: chatConfig.maxTokens,
    messages: sanitizedMessages,
    tools: {
      count_todos: countTodosTool,
    },
    toolChoice: 'auto',
    maxSteps: 8,
    onFinish: ({ text, toolCalls, toolResults }) => {
      if (toolCalls.length > 0) {
        console.log('Tool calls completed:', JSON.stringify(toolCalls))
        console.log('Tool results:', JSON.stringify(toolResults))
        console.log('Final text response:', text)
      }
    },
  })

  if (!stream) {
    return {
      stream: null,
      error: 'Error creating stream.',
    }
  }

  return {
    stream,
    error: null,
  }
}
