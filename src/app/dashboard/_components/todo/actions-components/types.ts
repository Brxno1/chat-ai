import { Todo } from '@/services/database/generated'

export type ActionsForTodoProps<T = unknown> = {
  todo: Todo
} & T

export type ActionsStatusProps = ActionsForTodoProps<{
  onCloseDropdown: () => void
}>
