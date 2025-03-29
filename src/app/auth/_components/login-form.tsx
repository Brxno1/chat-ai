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
} from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { env } from '@/lib/env'
import { cn } from '@/utils/utils'

const formSchema = z.object({
  email: z
    .string()
    .nonempty('O email não pode estar vazio')
    .email('Insira um email válido'),
})

type FormValue = z.infer<typeof formSchema>

interface LoginFormProps {
  onChangeMode: (email: string) => void
}

export function LoginForm({ onChangeMode }: LoginFormProps) {
  const form = useForm<FormValue>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  const { theme } = useTheme()

  async function handleSentMagicLink({ email }: FormValue) {
    try {
      const { error, user } = await getUserByEmail({ email })

      if (error) {
        throw new Error(error.message)
      }

      await signIn('email', {
        email,
        redirect: false,
        redirectTo: '/app',
      })

      toast('Link mágico enviado para: ', {
        action: (
          <Link
            href={env.MAILHOG_UI}
            target="_blank"
            className="cursor-pointer font-bold text-purple-400 hover:text-purple-500"
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
        shineColor={theme === 'dark' ? '#ffffff' : '#000000'}
        borderWidth={1}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSentMagicLink)} id="login-form">
          <CardHeader>
            <CardDescription>
              Insira seu e-mail abaixo para receber seu link de acesso.
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
                    <Input type="email" {...field} placeholder=" " />
                  </div>
                  <FormMessage className="text-red-500" />
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
            onClick={() => signIn('google', { redirectTo: '/app' })}
          >
            <RiGoogleFill className="me-1" size={16} aria-hidden="true" />
            Google
          </Button>
        </div>
      </Form>
    </Card>
  )
}
