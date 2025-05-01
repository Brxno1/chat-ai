'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { RiGoogleFill } from '@remixicon/react'
import { useMutation } from '@tanstack/react-query'
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
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { ContainerWrapper } from '@/components/container'
import { CopyTextComponent } from '@/components/copy-text-component'
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
import { useImageUpload } from '@/hooks/use-image-upload'
import { api } from '@/lib/axios'
import { env } from '@/lib/env'
import { createAccountSchema } from '@/schemas'
import { useSessionStore } from '@/store/user-store'
import { truncateText } from '@/utils/truncate-text'
import { cn } from '@/utils/utils'

type FormValues = z.infer<typeof createAccountSchema>

export function CreateAccountForm() {
  const { theme } = useTheme()
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

  const {
    fileName,
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange: onFileChange,
    handleRemove,
  } = useImageUpload()

  const handleRemoveFile = () => {
    handleRemove()
    form.setValue('avatar', null)
  }

  const handleFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(ev)
    form.setValue('avatar', ev.target.files?.[0])
  }

  const { mutateAsync } = useMutation({
    mutationFn: (formData: FormData) =>
      api.post<FormValues, AxiosResponse<User>>('/login', formData),
    onSuccess: ({ data: { name } }) => {
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
      handleRemove()
      form.reset()
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

  const onCreateAccount = async ({ name, email, avatar }: FormValues) => {
    const formData = new FormData()

    formData.append('name', name)
    formData.append('email', email)
    if (avatar) {
      formData.append('avatar', avatar)
    }

    await mutateAsync(formData)
  }

  return (
    <Card className="relative overflow-hidden">
      <ShineBorder
        shineColor={theme === 'dark' ? '#FEFEFE' : '#121212'}
        borderWidth={1}
      />
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
                        className={cn(
                          'inline-flex bg-muted px-2 dark:bg-background',
                          {
                            'text-red-500': fieldState.error,
                          },
                        )}
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
            <FormField
              name="avatar"
              control={form.control}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { value, ref, onChange, ...rest } }) => (
                <FormItem>
                  <div className="my-4 inline-flex w-full items-center justify-between align-top">
                    <div
                      className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-input"
                      aria-label={
                        previewUrl
                          ? 'Preview of uploaded image'
                          : 'Default user avatar'
                      }
                    >
                      {previewUrl && (
                        <ContainerWrapper className="h-full w-full">
                          <Image
                            className="h-full w-full object-cover"
                            src={previewUrl}
                            alt="Preview of uploaded image"
                            width={32}
                            height={32}
                          />
                        </ContainerWrapper>
                      )}
                      {!previewUrl && (
                        <ContainerWrapper
                          aria-hidden="true"
                          className="flex h-full w-full items-center justify-center"
                        >
                          <CircleUserRoundIcon
                            className="opacity-60"
                            size={24}
                          />
                        </ContainerWrapper>
                      )}
                    </div>
                    <div className="relative inline-block">
                      <Button
                        onClick={handleThumbnailClick}
                        type="button"
                        className="font-semibold"
                        variant="ghost"
                      >
                        {fileName && (
                          <>
                            <ArrowRightLeft className="h-4 w-4" />
                            Alterar foto
                          </>
                        )}
                        {!fileName && (
                          <>
                            <ImagePlus className="h-4 w-4" />
                            Selecionar foto
                          </>
                        )}
                      </Button>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          className="hidden"
                          multiple={false}
                          {...rest}
                          onChange={handleFileChange}
                        />
                      </FormControl>
                    </div>
                  </div>
                  {fileName && (
                    <div className="inline-flex gap-2 text-xs">
                      <CopyTextComponent
                        textForCopy={fileName}
                        className="text-muted-foreground"
                      >
                        <p
                          className="truncate text-muted-foreground"
                          aria-live="polite"
                        >
                          {truncateText({ text: fileName, maxLength: 20 })}
                        </p>
                      </CopyTextComponent>
                      {'-'}
                      <button
                        onClick={handleRemoveFile}
                        className="font-medium text-red-500 hover:underline"
                        aria-label={`Remove ${fileName}`}
                      >
                        Remover
                      </button>
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
            <InteractiveHoverButton
              type="submit"
              className="flex w-full items-center justify-center font-semibold"
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
          variant="default"
          className="font-semibold"
          onClick={() => signIn('google', { redirectTo: '/dashboard' })}
        >
          <RiGoogleFill className="me-1" size={16} aria-hidden="true" />
          Google
        </Button>
      </div>
    </Card>
  )
}
