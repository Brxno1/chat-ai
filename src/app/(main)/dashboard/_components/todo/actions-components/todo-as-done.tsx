import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookmarkCheck, CheckCircleIcon, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'

import { markTodoAsDoneAction } from '@/app/api/todo/actions/done-at-todo'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { queryKeys, todoInvalidations } from '@/lib/query-client'

import { ActionsStatusProps } from './types'

export function MarkTodoAsDone({ todo, onCloseDropdown }: ActionsStatusProps) {
  const queryClient = useQueryClient()

  const { mutateAsync: markTodoAsDoneFn, isPending: isMarkingAsDone } =
    useMutation({
      mutationFn: markTodoAsDoneAction,
      mutationKey: queryKeys.todoMutations.markAsDone,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: todoInvalidations.all() })
        toast.success(`Tarefa "${todo.title}" finalizada`, {
          position: 'top-center',
          duration: 2000,
        })
        onCloseDropdown()
      },
      onError: () => {
        toast.warning(`Erro ao finalizar "${todo.title}"`, {
          position: 'top-center',
          duration: 2000,
        })
      },
    })

  const handleMarkTodoAsDone = async (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    await markTodoAsDoneFn({ id: todo.id, userId: todo.userId })
  }

  const isDisabled =
    todo.doneAt !== null ||
    isMarkingAsDone ||
    todo.status === 'FINISHED' ||
    todo.status === 'CANCELLED'

  return (
    <DropdownMenuItem
      className="flex cursor-pointer items-center justify-between"
      disabled={isDisabled}
      onClick={handleMarkTodoAsDone}
    >
      {isMarkingAsDone ? (
        <>
          Finalizando...
          <LoaderCircle size={16} className="animate-spin" />
        </>
      ) : (
        <>
          {todo.status === 'FINISHED' ? (
            <>
              Finalizado
              <CheckCircleIcon size={16} />
            </>
          ) : (
            <>
              Finalizar
              <BookmarkCheck size={16} />
            </>
          )}
        </>
      )}
    </DropdownMenuItem>
  )
}
