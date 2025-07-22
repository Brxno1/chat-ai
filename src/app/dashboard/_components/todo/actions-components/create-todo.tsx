'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createTodoAction } from '@/app/api/todo/actions/create-todo'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSessionUser } from '@/context/user'
import { queryKeys } from '@/lib/query-client'
import { Todo } from '@/services/database/generated'
import { cn } from '@/utils/utils'

const schema = z.object({
  title: z.string().min(1, { message: 'Você precisa informar o título' }),
})

type TodoFormData = z.infer<typeof schema>

export function TodoCreateForm() {
  const [open, setOpen] = React.useState(false)
  const { user } = useSessionUser()

  const queryClient = useQueryClient()

  const form = useForm<TodoFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: '',
    },
  })

  const { mutateAsync: createTodoFn, isPending } = useMutation({
    mutationFn: createTodoAction,
    mutationKey: queryKeys.todoMutations.create,

    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.all })

      const previousTodos: Todo[] =
        queryClient.getQueryData(queryKeys.todos.all) || []

      const optimisticTodo: Todo = {
        ...newTodo,
        id: 'temp-id',
        status: 'PENDING',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        doneAt: null,
        cancelledAt: null,
        userId: user!.id!,
      }

      queryClient.setQueryData(queryKeys.todos.all, (oldTodos: Todo[]) => [
        optimisticTodo,
        ...oldTodos,
      ])

      return { previousTodos }
    },

    onSuccess: ({ todo }) => {
      queryClient.setQueryData(queryKeys.todos.all, (oldTodos: Todo[]) => [
        todo,
        ...oldTodos.filter((todo) => todo.id !== 'temp-id'),
      ])

      toast(`Tarefa "${todo!.title}" criada com sucesso`, {
        position: 'top-center',
        duration: 2000,
      })
      setOpen(false)
    },
    onError: (_error, data, context) => {
      queryClient.setQueryData(queryKeys.todos.all, context?.previousTodos)

      toast.error(`Erro ao criar a tarefa "${data.title}"`, {
        position: 'top-center',
        duration: 2000,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.all,
      })
      form.reset()
    },
  })

  async function handleCreateTodo(data: TodoFormData) {
    await createTodoFn({ title: data.title, userId: user!.id! })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Plus size={16} />
          Criar tarefa
        </Button>
      </SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>Olá, {user?.name}</SheetTitle>
          <SheetDescription>Qual será a tarefa de hoje?</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateTodo)}
            className="flex flex-col gap-4 py-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={cn('text-sm font-medium', {
                      'text-red-600': form.formState.errors.title,
                    })}
                  >
                    Título
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={cn({
                        'border-red-600': form.formState.errors.title,
                      })}
                    />
                  </FormControl>
                  <FormMessage
                    className={cn({
                      'text-red-600': form.formState.errors.title,
                    })}
                  />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="mx-auto w-[12rem] rounded-2xl font-bold"
              disabled={isPending || !form.formState.isValid}
            >
              {isPending ? 'Criando...' : 'Criar'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
