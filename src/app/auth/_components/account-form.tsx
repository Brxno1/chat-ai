'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RiGoogleFill } from '@remixicon/react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { LoaderCircle, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createAccount } from '@/app/(http)/user/login-account'
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'
import { ShineBorder } from '@/components/magicui/shine-border'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UploadAvatar } from '@/components/upload-avatar'
import { env } from '@/lib/env'
import { createAccountSchema } from '@/schemas'
import { useSessionStore } from '@/store/user-store'
import { cn } from '@/utils/utils'

type FormValues = z.infer<typeof createAccountSchema>

export function CreateAccountForm() {
  const { email } = useSessionStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(createAccountSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: email || '',
      avatar: null,
    },
  })

  const { mutateAsync: createAccountFn } = useMutation({
    mutationFn: createAccount,
    onSuccess: ({ name }) => {
      toast('Link mágico enviado para: ', {
        action: (
          <Link
            href={env.MAILHOG_UI}
            target="_blank"
            className="cursor-pointer font-bold text-purple-500 hover:underline"
          >
            {name}
          </Link>
        ),
        duration: 7000,
      })
      form.reset({
        name: '',
        email: '',
        avatar: null,
      })
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error('Erro ao logar com o link mágico', {
          action: (
            <Button
              form="form-auth"
              variant={'ghost'}
              type="submit"
              className="ml-auto transition-all hover:bg-red-950/40"
            >
              <RotateCw className="h-4 w-4 text-rose-300" />
            </Button>
          ),
        })
      }
    },
  })

  const onFileChange = (name: 'avatar', file: File | null) => {
    form.setValue(name, file)
    form.clearErrors(name)

    if (file) {
      form.trigger(name)
    }
  }

  const onCreateAccount = async ({ name, email, avatar }: FormValues) => {
    const formData = new FormData()

    formData.append('name', name)
    formData.append('email', email)

    if (avatar) formData.append('avatar', avatar)

    await createAccountFn(formData)
  }

  React.useEffect(() => {
    form.setFocus('name')
  }, [form])

  return (
    <Card className="relative overflow-hidden">
      <ShineBorder shineColor={'#7a41ff'} borderWidth={1} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateAccount)} id="form-auth">
          <CardHeader>
            <CardDescription>
              Insira seu e-mail e nome abaixo para criar uma conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <FormField
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
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
                        className={cn('inline-flex bg-card px-2', {
                          'text-red-500': fieldState.error,
                        })}
                      >
                        Nome
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder=" " />
                    </FormControl>
                  </div>
                  <FormMessage className="ml-2 text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem>
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
                        className={cn('inline-flex bg-card px-2', {
                          'text-red-500': fieldState.error,
                        })}
                      >
                        Email
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder=" " />
                    </FormControl>
                  </div>
                  <FormMessage className="ml-2 text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              name="avatar"
              control={form.control}
              render={() => (
                <FormItem>
                  <FormControl>
                    <UploadAvatar
                      className="mt-6"
                      onFileChange={onFileChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <InteractiveHoverButton
              type="submit"
              className="mx-auto flex w-[12rem] items-center justify-center rounded-2xl font-semibold"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  Enviando
                  <LoaderCircle className="ml-1 animate-spin font-semibold" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Criar e enviar link
                </span>
              )}
            </InteractiveHoverButton>
          </CardFooter>
        </form>
      </Form>
      <div className="my-4 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        <span className="text-xs text-muted-foreground">OU CRIE COM</span>
      </div>
      <div className="mb-6 flex justify-center">
        <Button
          variant="outline"
          className="mx-auto w-[12rem] rounded-2xl font-semibold"
          onClick={() => signIn('google', { redirectTo: '/dashboard' })}
        >
          <RiGoogleFill className="me-1" size={16} aria-hidden="true" />
          Google
        </Button>
      </div>
    </Card>
  )
}
