import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Trash } from 'lucide-react'
import { toast } from 'sonner'

import { deleteTodoAction } from '@/app/api/todo/actions/delete-todo'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { queryKeys, todoInvalidations } from '@/lib/query-client'

import { ActionsStatusProps } from './types'

export function DeleteTodo({ todo, onCloseDropdown }: ActionsStatusProps) {
  const queryClient = useQueryClient()

  const { mutateAsync: deleteTodoFn, isPending: isDeleting } = useMutation({
    mutationFn: deleteTodoAction,
    mutationKey: queryKeys.todoMutations.delete,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoInvalidations.all() })
      toast(`Tarefa "${todo.title}" deletada`, {
        position: 'top-center',
        duration: 2000,
      })
      onCloseDropdown()
    },
    onError: () => {
      toast.warning(`Erro ao deletar "${todo.title}"`, {
        position: 'top-center',
        duration: 2000,
      })
    },
  })

  const handleDeleteTodo = async (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    await deleteTodoFn({ id: todo.id, userId: todo.userId })
  }

  return (
    <DropdownMenuItem
      onClick={handleDeleteTodo}
      className="cursor-pointer items-center justify-between gap-4 hover:hover:bg-destructive hover:hover:text-destructive-foreground"
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          Excluindo...
          <LoaderCircle size={16} className="animate-spin" />
        </>
      ) : (
        <>
          Excluir
          <Trash size={16} />
        </>
      )}
    </DropdownMenuItem>
  )
}
