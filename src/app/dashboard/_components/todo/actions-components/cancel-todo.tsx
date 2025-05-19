import { useMutation } from '@tanstack/react-query'
import { LoaderCircle, XCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import { cancelTodoAction } from '@/app/api/todo/actions/cancel-todo'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { queryClient } from '@/lib/query-client'

import { ActionsStatusProps } from './types'

export function CancelTodo({ todo, onCloseDropdown }: ActionsStatusProps) {
  const { mutateAsync: cancelTodoFn, isPending: isCancelling } = useMutation({
    mutationFn: cancelTodoAction,
    mutationKey: ['cancel-todo'],

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast(`Tarefa "${todo.title}" cancelada`, {
        position: 'top-center',
        duration: 2000,
      })
      onCloseDropdown()
    },
    onError: () => {
      toast.warning(`Erro ao cancelar "${todo.title}"`, {
        position: 'top-center',
        duration: 2000,
      })
    },
  })

  const handleCancelTodo = async (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    await cancelTodoFn({ id: todo.id, userId: todo.userId })
  }

  const isDisabled =
    todo.doneAt !== null ||
    isCancelling ||
    todo.status === 'CANCELLED' ||
    todo.status === 'FINISHED'

  return (
    <DropdownMenuItem
      className="cursor-pointer flex-row items-center justify-between"
      onClick={handleCancelTodo}
      disabled={isDisabled}
    >
      {isCancelling ? (
        <>
          Cancelando...
          <LoaderCircle
            size={16}
            className="animate-spin font-semibold text-rose-500"
          />
        </>
      ) : (
        <>
          {todo.status === 'CANCELLED' ? (
            <>
              Cancelado
              <XCircleIcon size={16} />
            </>
          ) : (
            <>
              Cancelar
              <XCircleIcon size={16} />
            </>
          )}
        </>
      )}
    </DropdownMenuItem>
  )
}
