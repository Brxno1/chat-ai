import { todo } from 'node:test'

import { zodResolver } from '@hookform/resolvers/zod'
import { Todo } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateTodo } from '@/app/(http)/update-todo'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/utils'

const schema = z.object({
  title: z
    .string()
    .nonempty({ message: 'Você precisa informar o título' })
    .min(5, { message: 'Seu título deve conter pelo menos 5 caracteres' })
    .max(50, { message: 'Seu título deve conter no máximo 50 caracteres' })
    .refine((title) => !/^\d+$/.test(title), {
      message: 'O título não pode conter apenas números',
    })
    .refine((title) => !/^\s+$/.test(title), {
      message: 'O título não pode conter apenas espaços',
    }),
})

type TodoFormData = z.infer<typeof schema>

interface TodoUpdateFormProps {
  todo: Todo
  onCloseDialog: () => void
  onCloseDropdown: () => void
}

export function TodoUpdateForm({
  todo,
  onCloseDialog,
  onCloseDropdown,
}: TodoUpdateFormProps) {
  const form = useForm<TodoFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: todo.title,
    },
  })

  const { mutate: updateTodoFn, isPending: isUpdating } = useMutation({
    mutationFn: updateTodo,
    mutationKey: ['update-todo'],
    onSuccess: () => {
      toast(`Tarefa "${todo.title}" atualizada com sucesso`, {
        duration: 2000,
        position: 'top-center',
      })
      form.reset()
      onCloseDialog()
      onCloseDropdown()
    },
    onError: () => {
      toast.warning(
        `Erro ao atualizar "${todo.title}" para "${form.getValues('title')}"`,
        {
          duration: 2000,
          position: 'top-center',
        },
      )
    },
  })

  async function onUpdateTodo(data: TodoFormData) {
    updateTodoFn(data.title)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onUpdateTodo)}>
        <FormField
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
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
                  <Input
                    id="title"
                    type="text"
                    className="rounded-md"
                    placeholder=" "
                    {...field}
                  />
                </div>
                <FormMessage className="text-red-500" />
              </FormItem>
              <footer className="mt-4 flex flex-row justify-between gap-2">
                <Button
                  type="submit"
                  className="w-[6rem] text-center font-bold"
                  variant={'outline'}
                  disabled={
                    isUpdating ||
                    form.getValues('title') === todo.title ||
                    !form.formState.isValid
                  }
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
                  onClick={onCloseDialog}
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
