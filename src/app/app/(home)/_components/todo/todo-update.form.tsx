import { zodResolver } from '@hookform/resolvers/zod'
import { Todo } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateTodo } from '@/app/http/update-todo'
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
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1, { message: 'Você precisa informar o título' }),
})

type TodoFormData = z.infer<typeof schema>

interface TodoUpdateFormProps {
  todo: Todo
  openDialog: boolean
  handleCloseDialog: () => void
  handleCloseDropdown: () => void
}

export function TodoUpdateForm({
  todo,
  openDialog,
  handleCloseDialog,
  handleCloseDropdown,
}: TodoUpdateFormProps) {
  const form = useForm<TodoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: todo.title,
    },
  })

  useEffect(() => {
    if (openDialog) {
      form.setFocus('title')
    }
  }, [openDialog, form])

  const { mutate: updateTodoFn, isPending: isUpdating } = useMutation({
    mutationFn: updateTodo,
    mutationKey: ['update-todo'],
    onSuccess: () => {
      toast.success(`"${todo.title}" atualizado com sucesso`, {
        duration: 2000,
        position: 'top-center',
      })
      form.reset()
      handleCloseDialog()
      handleCloseDropdown()
    },
    onError: () => {
      toast.warning(`Erro ao atualizar "${todo.title}"`, {
        duration: 2000,
        position: 'top-center',
      })
    },
  })

  async function handleUpdateTodo(data: TodoFormData) {
    if (data.title === todo.title) {
      toast.warning('Escolha um título diferente', {
        duration: 2000,
        position: 'top-center',
      })
      form.setFocus('title')
      return
    }

    updateTodoFn(data.title)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateTodo)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <>
              <FormItem className="flex flex-col gap-2">
                <FormLabel
                  className={cn('', {
                    'text-red-500': form.formState.errors.title,
                  })}
                >
                  Título
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
              <footer className="mt-4 flex flex-row justify-between gap-2">
                <Button
                  type="submit"
                  className="w-[6rem] text-center font-bold"
                  variant={'outline'}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin text-white" />
                  ) : (
                    'Atualizar'
                  )}
                </Button>
                <Button
                  className="w-[6rem] text-center font-bold text-red-500 hover:text-red-600"
                  type="button"
                  variant={'outline'}
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
              </footer>
            </>
          )}
        />
      </form>
    </Form>
  )
}
