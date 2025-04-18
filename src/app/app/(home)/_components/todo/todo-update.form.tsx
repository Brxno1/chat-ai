import { zodResolver } from '@hookform/resolvers/zod'
import { Todo } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateTodo } from '@/app/(http)/update-todo'
import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
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

type TodoFormData = z.infer<typeof schema>

interface TodoUpdateFormProps {
  todo: Todo
  onCloseDropdown: () => void
}

export function TodoUpdateForm({ todo, onCloseDropdown }: TodoUpdateFormProps) {
  const form = useForm<TodoFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: todo.title,
    },
  })

  const { mutateAsync: updateTodoFn, isPending: isUpdating } = useMutation({
    mutationFn: updateTodo,
    mutationKey: ['update-todo'],
    onSuccess: () => {
      toast(`Tarefa "${todo.title}" atualizada com sucesso`, {
        duration: 2000,
        position: 'top-center',
      })
      form.reset()
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
    await updateTodoFn(data.title)
  }

  return (
    <Form {...form}>
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
