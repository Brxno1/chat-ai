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
  todos: {
    all: ['todos'] as const,
    lists: () => [...queryKeys.todos.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.todos.lists(), { filters }] as const,
    details: () => [...queryKeys.todos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.todos.details(), id] as const,
  },

  todoMutations: {
    create: ['create-todo'] as const,
    update: ['update-todo'] as const,
    delete: ['delete-todo'] as const,
    deleteById: (id: string) =>
      [...queryKeys.todoMutations.delete, id] as const,
    markAsDone: ['mark-todo-done'] as const,
    cancel: ['cancel-todo'] as const,
  },

  chats: {
    all: ['chats'] as const,
    lists: () => [...queryKeys.chats.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.chats.lists(), { filters }] as const,
    details: () => [...queryKeys.chats.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.chats.details(), id] as const,
  },

  chatMutations: {
    create: ['create-chat'] as const,
    update: ['update-chat'] as const,
    delete: () => ['delete-chat'] as const,
    deleteById: (id: string) =>
      [...queryKeys.chatMutations.delete(), id] as const,
  },

  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    session: () => [...queryKeys.user.all, 'session'] as const,
  },

  profile: {
    all: ['profile'] as const,
    update: () => [...queryKeys.profile.all, 'update'] as const,
  },
} as const

export const todoInvalidations = {
  all: () => queryKeys.todos.all,
  lists: () => queryKeys.todos.lists(),
  detail: (id: string) => queryKeys.todos.detail(id),
}

export const chatInvalidations = {
  all: () => queryKeys.chats.all,
  lists: () => queryKeys.chats.lists(),
}

export const profileInvalidations = {
  all: () => queryKeys.profile.all,
  update: () => queryKeys.profile.update(),
}
