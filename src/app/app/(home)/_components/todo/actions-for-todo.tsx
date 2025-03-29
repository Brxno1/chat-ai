'use client'

import { Todo } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { CheckIcon, CopyIcon, MoreHorizontal } from 'lucide-react'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { queryClient } from '@/lib/query-client'
import { cn } from '@/utils/utils'

import { TodoUpdateForm } from './todo-update.form'

interface ActionsForTodoProps {
  todo: Todo
}

export function ActionsForTodo({ todo }: ActionsForTodoProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  const { mutate: deleteTodoFn, isPending: isDeleting } = useMutation({
    mutationFn: deleteTodo,
    mutationKey: ['delete-todo'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast(`Tarefa "${todo.title}" deletada com sucesso`, {
        position: 'top-center',
        duration: 2000,
      })
    },
    onError: () => {
      toast.warning(`Erro ao deletar "${todo.title}"`, {
        position: 'top-center',
        duration: 2000,
      })
    },
  })

  function handleCloseDialogForUpdate() {
    setOpenDialog(false)
  }

  function handleCloseDropdownByActions() {
    setOpenDropdown(false)
  }

  function handleCopyTodoTitle(ev: React.MouseEvent<HTMLDivElement>) {
    ev.preventDefault()
    navigator.clipboard.writeText(todo.title)
    setHasCopied(true)
    setTimeout(() => {
      setHasCopied(false)
      setOpenDropdown(false)
    }, 800)
  }

  return (
    <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-4 h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2"
          onClick={handleCopyTodoTitle}
        >
          <div
            className={cn(
              'transition-all',
              hasCopied ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
            )}
          >
            <CheckIcon
              className="stroke-emerald-500"
              size={16}
              aria-hidden="true"
            />
          </div>
          <div
            className={cn(
              'absolute transition-all',
              hasCopied ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
            )}
          >
            <CopyIcon size={16} aria-hidden="true" />
          </div>
          Copiar título
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          Marcar como finalizado
        </DropdownMenuItem>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <span className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-muted [&>svg]:size-4 [&>svg]:shrink-0">
              Editar
            </span>
          </DialogTrigger>
          <DialogContent className="flex flex-col">
            <DialogHeader className="flex flex-row items-center justify-center">
              <DialogTitle>Editar Todo</DialogTitle>
            </DialogHeader>
            <TodoUpdateForm
              todo={todo}
              onCloseDialog={handleCloseDialogForUpdate}
              onCloseDropdown={handleCloseDropdownByActions}
            />
          </DialogContent>
        </Dialog>
        <DropdownMenuItem
          onClick={() => deleteTodoFn(todo.id)}
          className="cursor-pointer hover:hover:bg-destructive/90 hover:hover:text-destructive-foreground"
          disabled={isDeleting}
        >
          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
