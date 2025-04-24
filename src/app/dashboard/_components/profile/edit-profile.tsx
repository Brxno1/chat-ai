'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Edit, LoaderCircle } from 'lucide-react'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateProfile } from '@/app/(http)/update-profile'
import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCharacterLimit } from '@/hooks/use-character-limit'
import { editProfileSchema } from '@/schemas'
import { sleep } from '@/utils/sleep'
import { cn } from '@/utils/utils'

import { ProfileAvatar } from './profile-avatar'
import { ProfileBackground } from './profile-background'

type FileChange = {
  name: 'avatar' | 'background'
  file: File | null
}

export default function EditProfile({ user }: { user: Session['user'] }) {
  const { update } = useSession()
  const [open, setOpen] = React.useState(false)

  const id = React.useId()

  const form = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onChange',
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      avatar: user.image ? new File([], user.image) : null,
      background: user.background ? new File([], user.background) : null,
    },
  })

  const { mutateAsync: updateProfileFn, isPending: isUpdating } = useMutation({
    mutationFn: updateProfile,
    onSuccess: async ({ name, bio, image, background }) => {
      await update({
        trigger: 'update',
        data: {
          name,
          bio,
          image,
          background,
        },
      })

      await sleep(1000)
      toast('Perfil atualizado com sucesso!', {
        duration: 3000,
        position: 'top-center',
      })
      setOpen(false)
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil', {
        duration: 3000,
        position: 'top-center',
      })
    },
  })

  const onFileChange = ({ name, file }: FileChange) => {
    form.setValue(name, file)

    if (!file) {
      form.clearErrors(name)
    } else {
      form.clearErrors(name)
      form.trigger(name)
    }
  }

  const maxLengthForBio = 180

  const { characterCount, handleChange } = useCharacterLimit({
    maxLengthForBio,
    initialValue: user.bio || '',
  })

  React.useEffect(() => {
    const { avatar, background } = form.formState.errors

    if (background && avatar) {
      toast.error(`${background.message} | ${avatar.message}`, {
        duration: 2000,
        position: 'top-center',
      })
    } else if (background) {
      toast.error(background.message, {
        duration: 2000,
        position: 'top-center',
      })
    } else if (avatar) {
      toast.error(avatar.message, {
        duration: 2000,
        position: 'top-center',
      })
    }
  }, [form.formState.errors])

  const handleUpdateProfile = async ({
    name,
    bio,
    avatar,
    background,
  }: z.infer<typeof editProfileSchema>) => {
    const formData = new FormData()

    formData.append('name', name)
    formData.append('bio', bio)

    if (avatar) {
      formData.append('avatar', avatar)
    }

    if (background) {
      formData.append('background', background)
    }

    await updateProfileFn(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className={cn('h-3 w-3 cursor-pointer')} />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5"
        onPointerDownOutside={(ev) => {
          ev.preventDefault()
        }}
      >
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Editar perfil
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Faça alterações no seu perfil aqui. Você pode alterar seu nome, fotos
          e biografia.
        </DialogDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdateProfile)}
            id="update-profile-form"
          >
            <ContainerWrapper className="overflow-y-auto">
              <ProfileBackground
                Background={user.background}
                onFileChange={onFileChange}
              />
              <ProfileAvatar
                user={{
                  image: user.image,
                  name: user.name,
                }}
                onFileChange={onFileChange}
              />
              <div className="px-6 pb-6 pt-4">
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
                            className={cn('inline-flex bg-background px-2', {
                              'text-red-500': fieldState.error,
                            })}
                          >
                            Nome
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input type="text" placeholder=" " {...field} />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  name="bio"
                  control={form.control}
                  render={({ field: { onChange, ...rest }, fieldState }) => (
                    <FormItem>
                      <div className="group">
                        <FormLabel
                          className={cn('', {
                            'text-red-500': fieldState.error,
                          })}
                        >
                          <span
                            className={cn('inline-flex bg-background px-2', {
                              'text-red-500': fieldState.error,
                            })}
                          >
                            Biografia
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escreva uma biografia para o seu perfil"
                            aria-describedby={`${id}-description`}
                            onChange={(ev) => {
                              onChange(ev)
                              handleChange(ev)
                            }}
                            {...rest}
                          />
                        </FormControl>
                      </div>
                      <div className="flex items-center justify-between py-px">
                        <FormMessage className="text-xs text-red-500" />
                        <p
                          id={`${id}-description`}
                          className="ml-auto mt-2 text-right text-xs"
                          role="status"
                          aria-live="polite"
                        >
                          <span className="font-bold tabular-nums">
                            {maxLengthForBio - characterCount}
                          </span>{' '}
                          <span className="text-muted-foreground">
                            {maxLengthForBio - characterCount <= 1
                              ? 'caractere restante'
                              : 'carácteres restantes'}
                          </span>
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </ContainerWrapper>
          </form>
        </Form>
        <footer className="mt-4 flex flex-row justify-between gap-2 border-t p-6">
          <Button
            type="submit"
            className="min-w-[150px] font-semibold"
            disabled={form.formState.isSubmitting || isUpdating}
            form="update-profile-form"
          >
            {form.formState.isSubmitting ? (
              <LoaderCircle className="animate-spin font-semibold" />
            ) : (
              <span className="flex items-center gap-4">Salvar alterações</span>
            )}
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="border font-semibold text-red-600 hover:border hover:border-red-600 hover:bg-transparent hover:text-red-600"
            >
              Cancelar
            </Button>
          </DialogClose>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
