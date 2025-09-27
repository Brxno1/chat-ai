'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Trash } from 'lucide-react'
import { toast } from 'sonner'

import { deleteTodo } from '@/app/(http)/todo/delete-todo'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { queryKeys } from '@/lib/query-client'
import { ActionsStatusProps } from '@/types/todo'

export function DeleteTodo({ todo, onCloseDropdown }: ActionsStatusProps) {
  const queryClient = useQueryClient()

  const { mutateAsync: deleteTodoFn, isPending: isDeleting } = useMutation({
    mutationKey: queryKeys.todoMutations.deleteById(todo.id),
    mutationFn: deleteTodo,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.all,
      })
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

    await deleteTodoFn(todo.id)
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
