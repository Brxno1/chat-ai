'use client'

import { Todo } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import {
  BookmarkCheck,
  CheckIcon,
  Edit,
  LoaderCircle,
  MoreHorizontal,
  Trash,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { deleteTodo } from '@/app/(http)/delete-todo'
import { markTodoAsDone } from '@/app/api/todo/actions/done-at'
import { CopyTextComponent } from '@/components/copy-text-component'
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
  DropdownMenuGroup,
  DropdownMenuItem,
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

  const { mutateAsync: markTodoAsDoneFn, isPending: isMarkingAsDone } =
    useMutation({
      mutationFn: markTodoAsDone,
      mutationKey: ['mark-todo-done'],
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['todos'] })
        toast.success(`Tarefa "${todo.title}" finalizada`, {
          position: 'top-center',
          duration: 2000,
        })
        setOpenDropdown(false)
      },
      onError: () => {
        toast.warning(`Erro ao finalizar "${todo.title}"`, {
          position: 'top-center',
          duration: 2000,
        })
      },
    })

  const { mutateAsync: deleteTodoFn, isPending: isDeleting } = useMutation({
    mutationFn: deleteTodo,
    mutationKey: ['delete-todo'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success(`Tarefa "${todo.title}" deletada`, {
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

  function handleCloseDropdownByActions() {
    setOpenDropdown(false)
  }

  const handleMarkAsDone = async (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    try {
      await markTodoAsDoneFn(todo.id)
      setOpenDropdown(false)
    } catch (error) {
      console.error('Error marking todo as done:', error)
    }
  }

  return (
    <DropdownMenu
      open={openDropdown}
      onOpenChange={(open) => {
        if (!isMarkingAsDone) {
          setOpenDropdown(open)
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-4 h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <CopyTextComponent
              textForCopy={todo.title}
              onCloseComponent={handleCloseDropdownByActions}
            >
              Copiar todo
            </CopyTextComponent>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer gap-4"
            disabled={todo.doneAt !== null}
            onMouseDown={handleMarkAsDone}
          >
            {isMarkingAsDone ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin font-semibold"
                />
                Finalizando...
              </>
            ) : (
              <>
                {todo.status === 'FINISHED' ? (
                  <>
                    <CheckIcon size={16} className="text-green-500" />
                    Finalizado
                  </>
                ) : (
                  <>
                    <BookmarkCheck size={16} />
                    Finalizar
                  </>
                )}
              </>
            )}
          </DropdownMenuItem>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <span className="relative flex cursor-pointer select-none items-center gap-4 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-muted [&>svg]:size-4 [&>svg]:shrink-0">
                <Edit size={16} />
                Editar
              </span>
            </DialogTrigger>
            <DialogContent className="flex flex-col">
              <DialogHeader className="flex flex-row items-center justify-center">
                <DialogTitle>Editar Todo</DialogTitle>
              </DialogHeader>
              <TodoUpdateForm
                todo={todo}
                onCloseDropdown={handleCloseDropdownByActions}
              />
            </DialogContent>
          </Dialog>
          <DropdownMenuItem
            onClick={async () => await deleteTodoFn(todo.id)}
            className="cursor-pointer gap-4 hover:hover:bg-destructive hover:hover:text-destructive-foreground"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>Excluindo...</>
            ) : (
              <>
                <Trash size={16} />
                Excluir
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
