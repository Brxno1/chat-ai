'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RiGoogleFill } from '@remixicon/react'
import { AxiosError } from 'axios'
import {
  ArrowRight,
  ArrowRightLeft,
  CircleUserRoundIcon,
  ImagePlus,
  RotateCw,
} from 'lucide-react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/axios'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .nonempty('O email não pode estar vazio')
    .email('Insira um email válido'),
  file: z
    .union([
      z
        .instanceof(File, { message: 'Por favor, selecione um arquivo' })
        .refine(
          (file) => file.size <= 10 * 1024 * 1024,
          'O arquivo deve ter no máximo 10MB',
        ),
      z.undefined(),
    ])
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export function NewFormAuth() {
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
    mode: 'onBlur',
  })

  async function handleSentMagicLink(data: FormValues) {
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('email', data.email)
    if (data.file) {
      formData.append('file', data.file)
    }

    try {
      const response = await api.post('/login', formData)

      await signIn('email', {
        email: response.data.email,
        redirect: false,
        redirectTo: '/app',
      })

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
      handleRemove()
      form.reset()
    } catch (err) {
      if (err instanceof AxiosError) {
        console.log(err.response?.data)
        toast.error(err.response?.data.error, {
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
  }

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text

  const handleSelectFileWithButton = () => {
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
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Criar conta</TabsTrigger>
        <TabsTrigger value="login">Entrar</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <Form {...form}>
            <form
              id="form-auth"
              onSubmit={form.handleSubmit(handleSentMagicLink)}
            >
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
                    <>
                      <div className="group relative mb-4 space-y-2">
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
                            Nome
                          </span>
                        </FormLabel>
                        <Input
                          id="name"
                          type="text"
                          {...field}
                          placeholder=" "
                        />
                      </div>
                      <FormMessage className="text-red-500" />
                    </>
                  )}
                />
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
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
                    </>
                  )}
                />
                <FormField
                  name="file"
                  control={form.control}
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: { value, ref, onChange, ...rest } }) => (
                    <div>
                      <div className="mt-4 inline-flex w-full items-center justify-between align-top">
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
                            onClick={handleSelectFileWithButton}
                            aria-haspopup="dialog"
                            type="button"
                            className="font-semibold"
                            variant={'secondary'}
                          >
                            {fileName && (
                              <>
                                <ArrowRightLeft className="h-4 w-4" />
                                <span>Alterar foto</span>
                              </>
                            )}
                            {!fileName && (
                              <>
                                <ImagePlus className="h-4 w-4" />
                                <span>Selecionar foto</span>
                              </>
                            )}
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
              </CardContent>
              <CardFooter>
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
              </CardFooter>
            </form>
          </Form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
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
        </Card>
      </TabsContent>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
