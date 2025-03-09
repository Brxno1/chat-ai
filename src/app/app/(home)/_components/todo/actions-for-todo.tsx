'use client'

import { Todo } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { deleteTodo } from '@/app/(http)/delete-todo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { queryClient } from '@/lib/query-client'

import { TodoUpdateForm } from './todo-update.form'

interface ActionsForTodoProps {
  todo: Todo
}

export function ActionsForTodo({ todo }: ActionsForTodoProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)

  function handleCloseDialog() {
    setOpenDialog(false)
  }

  function handleCloseDropdown() {
    setOpenDropdown(false)
  }

  const { mutate: deleteTodoFn, isPending: isDeleting } = useMutation({
    mutationFn: deleteTodo,
    mutationKey: ['delete-todo'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success(`"${todo.title}" excluído com sucesso`, {
        duration: 1500,
        position: 'top-center',
      })
    },
    onError: () => {
      toast.warning(`Erro ao excluir "${todo.title}"`, {
        duration: 1500,
        position: 'top-center',
      })
    },
  })

  return (
    <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações para o Todo</DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigator.clipboard.writeText(todo.title)}
        >
          Copiar título
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          Marcar como finalizado
        </DropdownMenuItem>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <span className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-muted [&>svg]:size-4 [&>svg]:shrink-0">
              Editar
            </span>
          </DialogTrigger>
          <DialogContent className="flex w-full flex-col">
            <DialogHeader className="flex w-full flex-row items-center justify-center">
              <DialogTitle>Editar Todo</DialogTitle>
            </DialogHeader>
            <TodoUpdateForm
              todo={todo}
              openDialog={openDialog}
              handleCloseDialog={handleCloseDialog}
              handleCloseDropdown={handleCloseDropdown}
            />
          </DialogContent>
        </Dialog>
        <DropdownMenuItem
          onClick={() => deleteTodoFn(todo.id)}
          className="cursor-pointer hover:dark:bg-destructive"
          disabled={isDeleting}
        >
          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
