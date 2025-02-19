'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Todo } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { Loader2, MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { deleteTodo } from '@/app/http/delete-todo'
import { updateTodo } from '@/app/http/update-todo'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { queryClient } from '@/lib/query-client'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1, { message: 'Você precisa informar o título' }),
})

type TodoFormData = z.infer<typeof schema>

interface ActionsForTodoProps {
  todo: Todo
}

export function ActionsForTodo({ todo }: ActionsForTodoProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)

  const {
    handleSubmit,
    setFocus,
    reset,
    register,
    formState: { errors },
  } = useForm<TodoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: todo.title,
    },
  })

  const { mutate: updateTodoFn, isPending: isUpdating } = useMutation({
    mutationFn: updateTodo,
    mutationKey: ['update-todo'],
    onSuccess: () => {
      toast.success(`"${todo.title}" atualizado com sucesso`, {
        duration: 2000,
        position: 'top-center',
      })
      reset()
      setOpenDialog(false)
      setOpenDropdown(false)
    },
    onError: () => {
      toast.warning(`Erro ao atualizar "${todo.title}"`, {
        duration: 2000,
        position: 'top-center',
      })
    },
  })

  const { mutate: deleteTodoFn, isPending: isDeleting } = useMutation({
    mutationFn: deleteTodo,
    mutationKey: ['delete-todo'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success(`"${todo.title}" deletado com sucesso`, {
        duration: 2000,
        position: 'top-center',
      })
    },
    onError: () => {
      toast.warning(`Erro ao deletar "${todo.title}"`, {
        duration: 2000,
        position: 'top-center',
      })
    },
  })

  useEffect(() => {
    if (openDialog) {
      setFocus('title')
    }
  }, [openDialog, setFocus])

  async function handleUpdateTodo(data: TodoFormData) {
    if (data.title === todo.title) {
      toast.warning('Escolha um título diferente', {
        duration: 2000,
        position: 'top-center',
      })
      setFocus('title')
      return
    }

    updateTodoFn(data.title)
  }

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
          <DialogContent className="flex flex-col items-center">
            <DialogHeader className="flex w-full flex-row items-center justify-between">
              <DialogTitle>Editar Todo</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(handleUpdateTodo)}
              className="flex w-full flex-col gap-4 py-2"
            >
              <Label
                htmlFor="title"
                className={cn(['text-sm', errors.title && 'text-red-500'])}
              >
                Título
              </Label>
              <Input {...register('title')} id="title" />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
              <div className="flex justify-between">
                <Button type="submit" variant={'outline'} disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Salvar</span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant={'outline'}
                  className="text-red-500"
                  onClick={() => {
                    setOpenDialog(false)
                    reset()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
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
