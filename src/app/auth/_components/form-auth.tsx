'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { GoogleComponentIcon } from '@/components/google-svg'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/axios'

const formSchema = z.object({
  email: z.string().email('Por favor, insira um email válido'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
})

type FormValues = z.infer<typeof formSchema>

export function AuthForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  })

  async function handleSentMagicLink(data: FormValues) {
    const { name, email } = data
    try {
      await api.post('/login', { name, email })
      await signIn('email', { email, redirect: false, redirectTo: '/app' })

      toast('Link mágico enviado para: ', {
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
      reset()
    } catch (err) {
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
      console.log(err)
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
        <form
          id="form-auth"
          onSubmit={handleSubmit(handleSentMagicLink)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="seu nome aqui"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-zinc-950 font-semibold hover:bg-black/90 dark:bg-zinc-100 dark:text-background"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Enviando...'
            ) : (
              <span>
                Enviar link
                <ArrowRight className="ml-1 inline-block font-semibold" />
              </span>
            )}
          </Button>
        </form>
        <Separator className="my-4" />
        <CardFooter className="flex flex-col space-y-2 p-4">
          <div className="flex items-center justify-center">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              ou faça login com o Google
            </span>
          </div>
          <Button
            onClick={() => signIn('google', { redirectTo: '/app' })}
            className="flex w-full items-center justify-center bg-zinc-50 hover:bg-zinc-100"
          >
            <GoogleComponentIcon className="ml-2 h-5 w-5" />
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
