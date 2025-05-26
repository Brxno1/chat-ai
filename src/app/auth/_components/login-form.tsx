'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RiGoogleFill } from '@remixicon/react'
import { useMutation } from '@tanstack/react-query'
import { LoaderCircle, Mail, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getUserByEmail } from '@/app/api/login/actions/get-user-by-email'
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'
import { ShineBorder } from '@/components/magicui/shine-border'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { env } from '@/lib/env'
import { loginSchema } from '@/schemas'
import { cn } from '@/utils/utils'

type FormValue = z.infer<typeof loginSchema>

interface LoginFormProps {
  name: string
  onChangeMode: (email: string) => void
}

export function LoginForm({ name, onChangeMode }: LoginFormProps) {
  const form = useForm<FormValue>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  const { mutateAsync: sendMagicLink } = useMutation({
    mutationFn: getUserByEmail,
    onSuccess: async ({ user, success }) => {
      if (!success) {
        toast('Verifique seu e-mail ou tente novamente', {
          action: (
            <Button className="ml-2" size="icon" form="login-form">
              <Undo2 size={16} />
            </Button>
          ),
        })
        return
      }

      toast('Verifique seu e-mail para acessar a sua conta', {
        action: (
          <Button className="ml-2" size="icon">
            <Link href={env.MAILHOG_UI} target="_blank">
              <Mail size={16} />
            </Link>
          </Button>
        ),
        duration: 10000,
      })

      await signIn('email', {
        email: user!.email,
        redirect: false,
        redirectTo: '/dashboard',
      })
    },
    onError: () => {
      toast.error('Ocorreu um erro ao enviar o e-mail. Tente novamente.')
      onChangeMode(form.getValues('email'))
      form.reset()
    },
  })

  React.useEffect(() => {
    form.setFocus('email')
  }, [form])

  async function handleSentMagicLink({ email }: FormValue) {
    await sendMagicLink({ email })
  }

  return (
    <Card className="relative overflow-hidden">
      <ShineBorder shineColor={'#7a41ff'} borderWidth={1} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSentMagicLink)} id="login-form">
          <CardHeader className="gap-1 text-center">
            {name && (
              <CardTitle className="flex items-center justify-center text-lg font-bold">
                <span className="mr-2">Bem-vindo de volta,</span>
                <TypingAnimation>{name}</TypingAnimation>
              </CardTitle>
            )}
            <CardDescription>
              Entre com seu e-mail para receber seu link de acesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                        className={cn(
                          'inline-flex bg-muted px-2 dark:bg-background',
                          {
                            'text-red-500': fieldState.error,
                          },
                        )}
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
          </CardContent>
          <CardFooter className="my-2 flex justify-center">
            <InteractiveHoverButton
              type="submit"
              className="flex w-[12rem] items-center justify-center rounded-2xl font-semibold"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  Enviando
                  <LoaderCircle className="ml-1 size-4 animate-spin font-semibold" />
                </span>
              ) : (
                <>Enviar link</>
              )}
            </InteractiveHoverButton>
          </CardFooter>
        </form>
        <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          <span className="text-xs text-muted-foreground">OU ENTRE COM</span>
        </div>
        <div className="my-6 flex justify-center">
          <Button
            variant="outline"
            className="mx-auto w-[12rem] rounded-2xl font-semibold"
            onClick={() => signIn('google', { redirectTo: '/dashboard' })}
          >
            <RiGoogleFill className="me-1" size={16} aria-hidden="true" />
            Google
          </Button>
        </div>
      </Form>
    </Card>
  )
}
