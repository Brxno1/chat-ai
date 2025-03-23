'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { Session } from 'next-auth'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createTodo } from '@/app/(http)/create-todo'
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
import { queryClient } from '@/lib/query-client'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1, { message: 'Você precisa informar o título' }),
})

type TodoFormData = z.infer<typeof schema>

type CreateTodoResponse = {
  todo: {
    title: string
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
  }
}

export type UserProps = {
  user: Session['user']
}

const TodoCreateForm = ({ user }: UserProps) => {
  const [open, setOpen] = useState(false)

  const form = useForm<TodoFormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.setFocus('title')
    }
  }, [open, form])

  const { mutateAsync: createTodoFn, isPending } = useMutation({
    mutationFn: createTodo,
    mutationKey: ['create-todo'],
    onSuccess: (data: CreateTodoResponse) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setOpen(false)
      toast.success(`Tarefa "${data?.todo.title}" criada com sucesso!`, {
        position: 'top-center',
        duration: 2000,
      })
    },
    onError: () => {
      toast.error('Erro ao criar a tarefa', {
        position: 'top-center',
        duration: 2000,
      })
    },
  })

  async function handleCreateTodo(data: TodoFormData) {
    try {
      await createTodoFn({ title: data.title })
    } catch (err) {
    } finally {
      form.reset()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4" />
          Criar Tarefa
        </Button>
      </SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader className="flex flex-col gap-1">
          <SheetTitle>
            Olá, <span className="font-bold text-purple-500">{user.name}</span>
          </SheetTitle>
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
                    className={cn(
                      'text-sm font-medium',
                      form.formState.errors.title && 'text-red-600',
                    )}
                  >
                    Título
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={cn(
                        form.formState.errors.title && 'border-red-600',
                      )}
                    />
                  </FormControl>
                  <FormMessage
                    className={cn(
                      form.formState.errors.title && 'text-red-600',
                    )}
                  />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full font-bold"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2 text-purple-500">
                  Criar
                </span>
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default TodoCreateForm
