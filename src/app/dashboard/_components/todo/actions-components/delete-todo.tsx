import { useMutation } from '@tanstack/react-query'
import { Trash } from 'lucide-react'
import { toast } from 'sonner'

import { deleteTodoAction } from '@/app/api/todo/actions/delete-todo'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { queryClient } from '@/lib/query-client'

import { ActionsStatusProps } from './types'

export function DeleteTodo({ todo, onCloseDropdown }: ActionsStatusProps) {
  const { mutateAsync: deleteTodoFn, isPending: isDeleting } = useMutation({
    mutationFn: deleteTodoAction,
    mutationKey: ['delete-todo'],

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
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
          <Trash size={16} className="animate-bounce text-destructive" />
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
