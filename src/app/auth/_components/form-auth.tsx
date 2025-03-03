'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RiGoogleFill } from '@remixicon/react'
import { ArrowRight, CircleUserRoundIcon, RotateCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useCallback, useRef, useState } from 'react'
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
  file: z
    .instanceof(File, { message: 'Por favor, selecione um arquivo' })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'O arquivo deve ter no máximo 10MB',
    ),
})

type FormValues = z.infer<typeof formSchema>

export function OldAuthForm() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      file: undefined,
    },
  })

  async function handleSentMagicLink(data: FormValues) {
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('file', data.file || '')

    try {
      const response = await api.post('/login', formData)

      await signIn('email', {
        email: response.data.email,
        redirect: false,
        redirectTo: '/app',
      })

      sessionStorage.setItem('name', response.data.name)
      toast('Link mágico enviado para: ', {
        action: (
          <span
            onClick={() => window.open('http://localhost:8025', '_blank')}
            className="cursor-pointer font-bold text-purple-400 hover:text-purple-500"
          >
            {data.name}
          </span>
        ),
        duration: 5000,
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

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setFileName(null)
    if (previewUrl) {
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl])

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
            <FormField
              name="file"
              control={form.control}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { value, ref, onChange, ...rest } }) => (
                <div>
                  <div className="inline-flex w-full items-center justify-between align-top">
                    <div
                      className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-input"
                      aria-label={
                        previewUrl
                          ? 'Preview of uploaded image'
                          : 'Default user avatar'
                      }
                    >
                      {previewUrl ? (
                        <Image
                          className="h-full w-full object-cover"
                          src={previewUrl}
                          alt="Preview of uploaded image"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div aria-hidden="true">
                          <CircleUserRoundIcon
                            className="opacity-60"
                            size={16}
                          />
                        </div>
                      )}
                    </div>
                    <div className="relative inline-block">
                      <Button
                        onClick={handleButtonClick}
                        aria-haspopup="dialog"
                        type="button"
                        className="font-semibold"
                        variant={'secondary'}
                      >
                        {fileName ? 'Alterar imagem' : 'Selecionar imagem'}
                      </Button>
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        multiple={false}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          const url = URL.createObjectURL(file!)
                          setPreviewUrl(url)
                          setFileName(file!.name)
                          onChange(file)
                        }}
                        {...rest}
                      />
                    </div>
                  </div>
                  {fileName && (
                    <div className="mt-2">
                      <div className="inline-flex gap-2 text-xs">
                        <p
                          className="truncate text-muted-foreground"
                          aria-live="polite"
                        >
                          {truncateText(fileName, 20)}
                        </p>
                        {'-'}
                        <button
                          onClick={handleRemove}
                          className="font-medium text-red-500 hover:underline"
                          aria-label={`Remove ${fileName}`}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="sr-only" aria-live="polite" role="status">
                    {previewUrl
                      ? 'Image uploaded and preview available'
                      : 'No image uploaded'}
                  </div>
                </div>
              )}
            />
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
            variant="default"
            className="w-full font-semibold"
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
