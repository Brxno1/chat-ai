'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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

const schema = z.object({
  title: z.string().min(1, { message: 'Você precisa informar o título' }),
})

type TodoFormData = z.infer<typeof schema>

const TodoCreateForm = () => {
  const [open, setOpen] = useState(false)

  const form = useForm<TodoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
    },
  })
  const { handleSubmit, setFocus, reset, control } = form

  useEffect(() => {
    if (open) {
      setFocus('title')
    }
  }, [open, setFocus])

  const handleCreateTodo = async (data: TodoFormData) => {
    try {
      toast.success(`Tarefa "${data.title}" criada com sucesso!`, {
        position: 'top-center',
      })
      setOpen(false)
    } catch (error) {
      toast.error('Erro ao criar a tarefa')
    } finally {
      reset()
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
        <SheetHeader className="flex flex-col items-center gap-2">
          <SheetTitle>Crie uma tarefa</SheetTitle>
          <SheetDescription>
            Crie uma nova tarefa para começar a trabalhar.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleCreateTodo)}
            className="flex flex-col gap-4 py-6"
          >
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-bold">
              Criar
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default TodoCreateForm
