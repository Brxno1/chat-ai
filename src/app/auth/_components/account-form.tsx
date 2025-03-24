'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { RiGoogleFill } from '@remixicon/react'
import { AxiosError, AxiosResponse } from 'axios'
import {
  ArrowRightLeft,
  CircleUserRoundIcon,
  ImagePlus,
  LoaderCircle,
  RotateCw,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useTheme } from 'next-themes'
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { ContainerWrapper } from '@/components/container'
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
import { api } from '@/lib/axios'
import { env } from '@/lib/env'
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

const formSchema = z.object({
  name: z
    .string()
    .nonempty('O nome não pode estar vazio')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .nonempty('O email não pode estar vazio')
    .email('Insira um email válido'),
  file: z
    .union([
      z
        .instanceof(File, { message: 'Por favor, selecione um arquivo válido' })
        .refine(
          (file) => file.size <= 10 * 1024 * 1024,
          'O arquivo deve ter no máximo 10MB',
        ),
      z.null(),
    ])
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export function AccountForm() {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      name: '',
      file: undefined,
    },
  })

  const { theme } = useTheme()

  async function handleCreateAccount({ name, email, file }: FormValues) {
    const formData = new FormData()

    formData.append('name', name)
    formData.append('email', email)
    if (file) {
      formData.append('file', file)
    }

    try {
      const {
        data: { name },
      } = await api.post<FormValues, AxiosResponse<User>>('/login', formData)

      toast('Link mágico enviado para: ', {
        action: (
          <Link
            href={env.MAILHOG_UI}
            target="_blank"
            className="cursor-pointer font-bold text-purple-400 hover:text-purple-500"
          >
            {name}
          </Link>
        ),
        duration: 7000,
      })
      handleRemoveAvatarFile()
      form.reset()
    } catch (err) {
      if (err instanceof AxiosError) {
        console.log(err.message)

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
    }
  }

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveAvatarFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setFileName(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl])

  return (
    <Card className="relative overflow-hidden">
      <ShineBorder
        shineColor={theme === 'dark' ? '#FEFEFE' : '#121212'}
        borderWidth={1}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateAccount)} id="form-auth">
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
                <FormItem className="mb-4">
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
                        Nome
                      </span>
                    </FormLabel>
                    <Input id="name" type="text" {...field} placeholder=" " />
                  </div>
                  <FormMessage className="text-red-500" />
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
            <FormField
              name="file"
              control={form.control}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { value, ref, onChange, ...rest } }) => (
                <FormItem>
                  <div className="mt-4 inline-flex w-full items-center justify-between align-top">
                    <div
                      className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-input"
                      aria-label={
                        previewUrl
                          ? 'Preview of uploaded image'
                          : 'Default user avatar'
                      }
                    >
                      {previewUrl ? (
                        <ContainerWrapper className="h-full w-full">
                          <Image
                            className="h-full w-full object-cover"
                            src={previewUrl}
                            alt="Preview of uploaded image"
                            width={32}
                            height={32}
                          />
                        </ContainerWrapper>
                      ) : (
                        <div
                          aria-hidden="true"
                          className="flex h-full w-full items-center justify-center"
                        >
                          <CircleUserRoundIcon
                            className="opacity-60"
                            size={24}
                          />
                        </div>
                      )}
                    </div>
                    <div className="relative inline-block">
                      <Button
                        onClick={handleSelectFile}
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
                          onChange(file)
                          setPreviewUrl(url)
                          setFileName(file!.name)
                        }}
                        {...rest}
                      />
                    </div>
                  </div>
                  {fileName && (
                    <div className="mt-2">
                      <div className="inline-flex gap-2 text-xs">
                        <p
                          className="truncate text-muted-foreground hover:cursor-pointer"
                          aria-live="polite"
                          onClick={() =>
                            navigator.clipboard.writeText(fileName)
                          }
                        >
                          {truncateText(fileName, 20)}
                        </p>
                        {'-'}
                        <button
                          onClick={handleRemoveAvatarFile}
                          className="font-medium text-red-600 hover:underline"
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
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="flex w-full items-center justify-center font-semibold"
              disabled={form.formState.isSubmitting}
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
  )
}
