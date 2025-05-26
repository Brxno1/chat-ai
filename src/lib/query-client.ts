import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
      },
    },
  })
}

export const queryKeys = {
  // Todos
  todos: {
    all: ['todos'] as const,
    lists: () => [...queryKeys.todos.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.todos.lists(), { filters }] as const,
    details: () => [...queryKeys.todos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.todos.details(), id] as const,
  },

  // Todo Mutations
  todoMutations: {
    create: ['create-todo'] as const,
    update: ['update-todo'] as const,
    delete: ['delete-todo'] as const,
    markAsDone: ['mark-todo-done'] as const,
    cancel: ['cancel-todo'] as const,
  },

  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    session: () => [...queryKeys.user.all, 'session'] as const,
  },
} as const

export const todoInvalidations = {
  all: () => queryKeys.todos.all,
  lists: () => queryKeys.todos.lists(),
}
