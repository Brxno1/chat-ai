'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
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
import { queryClient } from '@/lib/query-client'
import { useSessionStore } from '@/store/user-store'
import { cn } from '@/utils/utils'

const schema = z.object({
  title: z.string().min(1, { message: 'Você precisa informar o título' }),
})

type TodoFormData = z.infer<typeof schema>

const TodoCreateForm = () => {
  const { user } = useSessionStore()
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
    mutationKey: ['create-todo'],
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setOpen(false)
      toast.success(`Tarefa "${variables.title}" criada com sucesso`, {
        position: 'top-center',
        duration: 2000,
      })
      form.reset()
    },
    onError: (_error, variables) => {
      toast.error(`Erro ao criar a tarefa "${variables.title}"`, {
        position: 'top-center',
        duration: 2000,
      })
    },
  })

  React.useEffect(() => {
    open ? form.setFocus('title') : form.reset()
  }, [open, form])

  async function handleCreateTodo(data: TodoFormData) {
    try {
      await createTodoFn({ title: data.title })
    } catch (err) {
      form.reset()
    }
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
        <SheetHeader className="flex flex-col gap-1">
          <SheetTitle>
            Olá, <span className="font-bold text-purple-500">{user?.name}</span>
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
            <Button type="submit" className="font-bold" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Criando...
                </>
              ) : (
                <span>Criar</span>
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default TodoCreateForm
