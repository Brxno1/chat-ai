import { Todo } from '@prisma/client'

export type ActionsForTodoProps<T = unknown> = {
  todo: Todo
} & T

export type ActionsStatusProps = ActionsForTodoProps<{
  onCloseDropdown: () => void
}>
