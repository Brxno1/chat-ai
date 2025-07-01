import { tool } from 'ai'
import { z } from 'zod'

import { getTodosAction } from '@/app/api/todo/actions/get-todos'

export const countTodosTool = tool({
  description:
    'Conte quantos todos (tarefas) o usuário tem. Use esta ferramenta APENAS quando o usuário estiver LOGADO (isLoggedIn = true) e perguntar sobre a quantidade de tarefas, to-dos. Se o usuário NÃO estiver logado, NÃO use esta ferramenta e em vez disso informe que é necessário fazer login para acessar os to-dos.',
  parameters: z.object({}),
  execute: async () => {
    const todos = await getTodosAction()

    const pendingTodos = todos.filter((todo) => todo.status === 'PENDING')
    const finishedTodos = todos.filter((todo) => todo.status === 'FINISHED')
    const cancelledTodos = todos.filter((todo) => todo.status === 'CANCELLED')

    const firstPendingTodos = pendingTodos.slice(0, 5).map((todo) => ({
      title: todo.title,
      createdAt: todo.createdAt.toISOString(),
    }))

    return {
      totalCount: todos.length,
      pendingCount: pendingTodos.length,
      finishedCount: finishedTodos.length,
      cancelledCount: cancelledTodos.length,
      pendingTodos: firstPendingTodos,
      hasMorePending: pendingTodos.length > 5,
      message: `Você tem ${todos.length} tarefas no total, sendo ${pendingTodos.length} pendentes, ${finishedTodos.length} concluídas e ${cancelledTodos.length} canceladas.`,
    }
  },
})
