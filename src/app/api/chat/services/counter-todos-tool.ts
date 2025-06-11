/* eslint-disable */
import { tool } from 'ai'
import { z } from 'zod'

import { getTodosAction } from '@/app/api/todo/actions/get-todos'

export const countTodosTool = tool({
  description: 'Ferramenta para consultar e listar os to-dos do usuário. Use esta ferramenta APENAS quando o usuário estiver LOGADO (isLoggedIn = true) e solicitar informações sobre suas tarefas, como quantidade, listagem por status, etc. Se o usuário NÃO estiver logado, NÃO use esta ferramenta.',
  parameters: z.object({
    listType: z.enum(['all', 'pending', 'finished', 'cancelled']).describe(
      'Tipo de listagem: "all" para todos os to-dos, "pending" para pendentes, "finished" para concluídos, "cancelled" para cancelados'
    ).default('all'),
    showDetails: z.boolean().describe(
      'Se deve mostrar detalhes dos to-dos ou apenas contagens'
    ).default(true),
    limit: z.number().describe(
      'Limite de to-dos a serem listados (por padrão 5)'
    ).default(5),
  }),
  execute: async ({ listType, showDetails, limit }, { messages }) => {
    // Depuração: registrar o início da execução
    console.log('[countTodosTool] Iniciando busca de todos')

    const todos = await getTodosAction()

    // Depuração: registrar quantidade total
    console.log(`[countTodosTool] Total de todos encontrados: ${todos.length}`)

    // Verificar os status existentes para depuração
    const uniqueStatuses = [...new Set(todos.map(todo => todo.status))]
    console.log('[countTodosTool] Status únicos encontrados:', uniqueStatuses)

    // Contar manualmente cada status para depuração
    let manualCountPending = 0;
    let manualCountFinished = 0;
    let manualCountCancelled = 0;

    todos.forEach(todo => {
      if (todo.status === 'PENDING') manualCountPending++;
      else if (todo.status === 'FINISHED') manualCountFinished++;
      else if (todo.status === 'CANCELLED') manualCountCancelled++;
      else console.log(`[countTodosTool] Status desconhecido: ${todo.status}`);
    });

    console.log(`[countTodosTool] Contagem manual - PENDING: ${manualCountPending}, FINISHED: ${manualCountFinished}, CANCELLED: ${manualCountCancelled}`)

    // Filtramos com base no tipo solicitado
    const filteredTodos = listType === 'all'
      ? todos
      : todos.filter((todo) => {
        switch (listType) {
          case 'pending': return todo.status === 'PENDING';
          case 'finished': return todo.status === 'FINISHED';
          case 'cancelled': return todo.status === 'CANCELLED';
          default: return true;
        }
      });

    // Contagens por status
    const pendingCount = todos.filter((todo) => todo.status === 'PENDING').length
    const finishedCount = todos.filter((todo) => todo.status === 'FINISHED').length
    const cancelledCount = todos.filter((todo) => todo.status === 'CANCELLED').length

    // Depuração: comparar contagens
    console.log(`[countTodosTool] Contagem por filter - PENDING: ${pendingCount}, FINISHED: ${finishedCount}, CANCELLED: ${cancelledCount}`)

    // Preparamos a lista limitada de to-dos para exibição
    const todosList = filteredTodos.slice(0, limit).map((todo) => ({
      title: todo.title,
      status: todo.status,
      createdAt: todo.createdAt.toISOString(),
    }))

    // Preparamos mensagens adequadas para cada tipo de listagem
    let statusMessage = '';
    switch (listType) {
      case 'all':
        statusMessage = `Você tem ${todos.length} tarefas no total, sendo ${pendingCount} pendentes, ${finishedCount} concluídas e ${cancelledCount} canceladas.`;
        break;
      case 'pending':
        statusMessage = `Você tem ${pendingCount} tarefas pendentes de um total de ${todos.length} tarefas.`;
        break;
      case 'finished':
        statusMessage = `Você tem ${finishedCount} tarefas concluídas de um total de ${todos.length} tarefas.`;
        break;
      case 'cancelled':
        statusMessage = `Você tem ${cancelledCount} tarefas canceladas de um total de ${todos.length} tarefas.`;
        break;
    }

    // Se solicitou detalhes e há tarefas, adiciona informação à mensagem
    if (showDetails && todosList.length > 0) {
      statusMessage += `\n\nAqui ${todosList.length === 1 ? 'está' : 'estão'} ${todosList.length === 1 ? 'a tarefa' : 'as tarefas'} ${listType === 'all' ? '' : `com status ${listType}`}:`;
      todosList.forEach((todo, index) => {
        statusMessage += `\n${index + 1}. "${todo.title}" (${todo.status === 'PENDING' ? 'pendente' : todo.status === 'FINISHED' ? 'concluída' : 'cancelada'})`;
      });
      if (filteredTodos.length > limit) {
        statusMessage += `\n\n... e mais ${filteredTodos.length - limit} ${filteredTodos.length - limit === 1 ? 'tarefa' : 'tarefas'} não ${filteredTodos.length - limit === 1 ? 'listada' : 'listadas'}.`;
      }
    }

    // Retorna apenas o texto formatado
    return {
      text: statusMessage,
    };
  },
})
/* eslint-enable */
