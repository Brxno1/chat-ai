'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createTodo } from '@/app/(http)/todo/create-todo'
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
import { queryKeys, todoInvalidations } from '@/lib/query-client'
import { useSessionStore } from '@/store/user-store'
import { cn } from '@/utils/utils'

const schema = z.object({
  title: z.string().min(1, { message: 'Você precisa informar o título' }),
})

type TodoFormData = z.infer<typeof schema>

export function TodoCreateForm() {
  const { user } = useSessionStore()
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)

  const form = useForm<TodoFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: '',
    },
  })

  const { mutateAsync: createTodoFn, isPending } = useMutation({
    mutationFn: createTodo,
    mutationKey: queryKeys.todoMutations.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: todoInvalidations.all() })

      toast(`Tarefa "${variables.title}" criada com sucesso`, {
        position: 'top-center',
        duration: 2000,
      })
      form.reset()
      setOpen(false)
    },
    onError: (_error, variables) => {
      toast.error(`Erro ao criar a tarefa "${variables.title}"`, {
        position: 'top-center',
        duration: 2000,
      })
      form.reset()
    },
  })

  React.useEffect(() => {
    open ? form.setFocus('title') : form.reset()
  }, [open, form])

  async function handleCreateTodo(data: TodoFormData) {
    await createTodoFn({ title: data.title })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Plus size={16} />
          Criar Tarefa
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
