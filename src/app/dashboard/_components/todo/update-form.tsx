'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Todo } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Loader2 } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateTodoAction } from '@/app/api/todo/actions/update-todo'
import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { queryKeys } from '@/lib/query-client'
import { cn } from '@/utils/utils'

const schema = z.object({
  title: z
    .string()
    .min(5, { message: 'O título deve conter pelo menos 5 carácteres' })
    .max(50, { message: 'O título deve conter no máximo 50 carácteres' })
    .nonempty({ message: 'Você precisa informar um título' })
    .refine((title) => !/^\d+$/.test(title), {
      message: 'O título não pode conter apenas números',
    })
    .superRefine((title, ctx) => {
      if (title.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'O título não pode conter apenas espaços',
        })
        return false
      }
      return true
    }),
})

interface TodoUpdateProps {
  todo: Todo
  onCloseDropdown: () => void
}

function TodoUpdateForm({ todo, onCloseDropdown }: TodoUpdateProps) {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: todo.title,
    },
  })

  const { mutateAsync: updateTodoFn, isPending: isUpdating } = useMutation({
    mutationFn: updateTodoAction,
    mutationKey: queryKeys.todoMutations.update,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.all,
      })
      toast(`Tarefa "${variables.title}" atualizada com sucesso`, {
        duration: 2000,
        position: 'top-center',
      })
      form.reset()
      onCloseDropdown()
    },
    onError: (error) => {
      toast.warning(error.message, {
        duration: 2000,
        position: 'top-center',
      })
    },
  })

  async function onUpdateTodo(data: z.infer<typeof schema>) {
    await updateTodoFn({
      userId: todo.userId,
      id: todo.id,
      title: data.title,
    })
  }

  return (
    <Form {...form}>
      <DialogHeader className="flex flex-row items-center justify-center">
        <DialogTitle>Editar Todo</DialogTitle>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onUpdateTodo)}>
        <FormField
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <ContainerWrapper>
              <FormItem className="mb-5">
                <div className="group relative space-y-2">
                  <FormLabel
                    className={cn(
                      'className="origin-start has-[+input:not(:placeholder-shown)]:font-medium" absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:text-foreground',
                      {
                        'text-red-500': fieldState.error,
                      },
                    )}
                  >
                    <span
                      className={cn('inline-flex bg-background px-2', {
                        'text-red-500': fieldState.error,
                      })}
                    >
                      Título
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      type="text"
                      className="rounded-md"
                      placeholder=" "
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="ml-2 text-red-500" />
              </FormItem>
              <footer className="mt-4 flex flex-row justify-around gap-2">
                <Button
                  type="submit"
                  className="w-[6rem] text-center font-bold"
                  variant={'outline'}
                  disabled={
                    isUpdating ||
                    !form.formState.isValid ||
                    !form.formState.isDirty
                  }
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Atualizar'
                  )}
                </Button>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="border font-semibold text-red-600 hover:border hover:border-red-600 hover:bg-transparent hover:text-red-600"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
              </footer>
            </ContainerWrapper>
          )}
        />
      </form>
    </Form>
  )
}

export function UpdateTodo({ todo, onCloseDropdown }: TodoUpdateProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-pointer select-none items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-muted [&>svg]:size-4 [&>svg]:shrink-0">
          Editar
          <Edit size={16} />
        </span>
      </DialogTrigger>
      <DialogContent>
        <TodoUpdateForm todo={todo} onCloseDropdown={onCloseDropdown} />
      </DialogContent>
    </Dialog>
  )
}
