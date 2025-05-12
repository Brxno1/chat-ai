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
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { deleteTodo } from '@/app/(http)/todo/delete-todo'
import { actionMarkTodoAsDone } from '@/app/api/todo/actions/done-at'
import { CopyTextComponent } from '@/components/copy-text-component'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { queryClient } from '@/lib/query-client'

import { TodoUpdateForm } from './update.form'

interface ActionsForTodoProps {
  todo: Todo
}

export function ActionsForTodo({ todo }: ActionsForTodoProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)

  const { mutateAsync: markTodoAsDoneFn, isPending: isMarkingAsDone } =
    useMutation({
      mutationFn: actionMarkTodoAsDone,
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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer">
              <span>Copiar todo</span>
              <CopyTextComponent
                textForCopy={todo.title}
                onCloseComponent={handleCloseDropdownByActions}
                className="absolute right-2"
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex cursor-pointer items-center justify-between"
              disabled={todo.doneAt !== null}
              onMouseDown={handleMarkAsDone}
            >
              {isMarkingAsDone ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="animate-spin font-semibold text-green-500"
                  />
                  Finalizando...
                </>
              ) : (
                <>
                  {todo.status === 'FINISHED' ? (
                    <>
                      Finalizado
                      <CheckIcon size={16} className="text-green-500" />
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
            <DialogTrigger asChild>
              <span className="relative flex cursor-pointer select-none items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-muted [&>svg]:size-4 [&>svg]:shrink-0">
                Editar
                <Edit size={16} />
              </span>
            </DialogTrigger>
            <DialogContent className="flex flex-col">
              <TodoUpdateForm
                todo={todo}
                onCloseDropdown={handleCloseDropdownByActions}
              />
            </DialogContent>
            <DropdownMenuItem
              className="cursor-pointer flex-row items-center justify-between"
              onClick={() => {
                toast.warning('Tarefa cancelada', {
                  position: 'top-center',
                  duration: 2000,
                  icon: <X size={16} />,
                })
              }}
            >
              Cancelar
              <X size={16} />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => await deleteTodoFn(todo.id)}
              className="cursor-pointer items-center justify-between gap-4 hover:hover:bg-destructive hover:hover:text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>Excluindo...</>
              ) : (
                <>
                  Excluir
                  <Trash size={16} />
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </Dialog>
    </DropdownMenu>
  )
}
