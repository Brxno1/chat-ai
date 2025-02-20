'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { RiGoogleFill } from '@remixicon/react'
import { ArrowRight, RotateCw } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const formSchema = z.object({
  email: z.string().email('Por favor, insira um email válido'),
})

type FormValues = z.infer<typeof formSchema>

export function LoginUserForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function handleSentMagicLink(data: FormValues) {
    const { email } = data
    try {
      await signIn('email', { email, redirect: false, callbackUrl: '/app' })

      toast('Link mágico enviado para: ', {
        duration: 10000,
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
    <div className="mx-auto w-full max-w-sm">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl">Login</CardTitle>
          <CardDescription className="text-center">
            Insira seu email abaixo para fazer login na sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-auth"
            onSubmit={handleSubmit(handleSentMagicLink)}
            className="space-y-4"
          >
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
                  Send magic link
                  <ArrowRight className="ml-1 inline-block font-semibold" />
                </span>
              )}
            </Button>
          </form>
          <Separator className="my-6" />
          <Button
            variant="outline"
            className="w-full bg-zinc-950 font-semibold hover:bg-black/90 dark:bg-zinc-100 dark:text-background"
            onClick={() => signIn('google', { redirectTo: '/app' })}
          >
            <RiGoogleFill className="me-1" size={16} aria-hidden="true" />
            Login com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
