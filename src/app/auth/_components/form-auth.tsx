'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RiGoogleFill } from '@remixicon/react'
import { ArrowRight, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/axios'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  email: z.string().email('Por favor, insira um email válido'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
})

type FormValues = z.infer<typeof formSchema>

export function AuthForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  })
  async function handleSentMagicLink(data: FormValues) {
    const { name, email } = data
    try {
      const response = await api.post('/login', { name, email })
      await signIn('email', {
        email: response.data.email,
        redirect: false,
        redirectTo: '/app',
      })
      toast('Link mágico enviado para: ', {
        duration: 5000,
        action: (
          <span
            onClick={() =>
              window.open(
                'https://mailtrap.io/inboxes/3449582/messages',
                '_blank',
              )
            }
            className="cursor-pointer font-bold text-purple-400 hover:text-purple-500"
          >
            {data.email}
          </span>
        ),
      })
      form.reset()
    } catch (err) {
      console.log(err)
      toast.error('Erro ao enviar email, tente novamente', {
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
  }
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl">Login</CardTitle>
        <CardDescription className="text-center">
          Insira seu e-mail e nome abaixo para criar uma conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id="form-auth"
            onSubmit={form.handleSubmit(handleSentMagicLink)}
            className="space-y-4"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <FormLabel
                    className={cn('', {
                      'text-red-500': fieldState.error,
                    })}
                  >
                    Nome
                  </FormLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="seu nome aqui"
                    {...field}
                  />
                  <FormMessage className="text-red-500" />
                </div>
              )}
            />
            <div className="space-y-2">
              <FormField
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <FormLabel
                      className={cn('', {
                        'text-red-500': fieldState.error,
                      })}
                    >
                      Email
                    </FormLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@example.com"
                      {...field}
                    />
                    <FormMessage className="text-red-500" />
                  </div>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-zinc-950 font-semibold hover:bg-black/90 dark:bg-zinc-100 dark:text-background"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                'Enviando...'
              ) : (
                <span>
                  Enviar link
                  <ArrowRight className="ml-1 inline-block font-semibold" />
                </span>
              )}
            </Button>
          </form>
        </Form>
        <Separator className="my-4" />
        <CardFooter className="flex flex-col space-y-2 p-4">
          <Button
            variant="outline"
            className="w-full bg-zinc-950 font-semibold hover:bg-black/90 dark:bg-zinc-100 dark:text-background"
            onClick={() => signIn('google', { redirectTo: '/app' })}
          >
            <RiGoogleFill className="me-1" size={16} aria-hidden="true" />
            Login com Google
          </Button>
          <div className="mb-auto text-center">
            <Link
              className="border-b-2 border-border text-sm text-zinc-600 hover:border-blue-500 dark:text-zinc-300"
              href={'/login'}
            >
              Já possui uma conta?
            </Link>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  )
}
