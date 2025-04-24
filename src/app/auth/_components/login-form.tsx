'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RiGoogleFill } from '@remixicon/react'
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getUserByEmail } from '@/app/api/login/actions/get-user-by-email'
import { ShineBorder } from '@/components/magicui/shine-border'
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
  const { theme } = useTheme()
  const form = useForm<FormValue>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  async function handleSentMagicLink({ email }: FormValue) {
    try {
      const { error, user } = await getUserByEmail({ email })

      if (error) {
        throw new Error(error.message)
      }

      await signIn('email', {
        email,
        redirect: false,
        redirectTo: '/dashboard',
      })

      toast('Link mágico enviado para: ', {
        action: (
          <Link
            href={env.MAILHOG_UI}
            target="_blank"
            className="cursor-pointer font-bold text-purple-500 hover:underline"
          >
            {user!.name}
          </Link>
        ),
        duration: 7000,
      })
      form.reset()
    } catch (error) {
      toast.error('Entre com uma conta existente ou crie uma nova conta.')
      onChangeMode(email)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <ShineBorder
        shineColor={theme === 'dark' ? '#FEFEFE' : '#121212'}
        borderWidth={1}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSentMagicLink)} id="login-form">
          <CardHeader className="gap-1 text-center">
            <CardTitle>
              {name && (
                <p>
                  Bem-vindo de volta,{' '}
                  <span className="text-purple-500">{name}</span>!
                </p>
              )}
            </CardTitle>
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
                        className={cn('inline-flex bg-background px-2', {
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
          </CardContent>
          <CardFooter className="mt-2 flex justify-center">
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  Enviando
                  <LoaderCircle className="ml-1 animate-spin font-semibold" />
                </span>
              ) : (
                <span className="flex items-center gap-4">Enviar link</span>
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="my-4 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          <span className="text-xs text-muted-foreground">OU ENTRE COM</span>
        </div>
        <div className="mb-6 mt-3 flex justify-center">
          <Button
            variant="default"
            className="font-semibold"
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
