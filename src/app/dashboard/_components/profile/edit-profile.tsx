'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { UserPen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateProfile } from '@/app/(http)/user/update-profile'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
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
import { useUser } from '@/context/user-provider'
import { useCharacterLimit } from '@/hooks/use-character-limit'
import { updateProfileSchema } from '@/schemas'
import { cn } from '@/utils/utils'

import { BackgroundProfile } from './avatar-background'
import { AvatarProfile } from './avatar-profile'

interface EditProfileProps {
  className?: string
}

export function EditProfile({ className }: EditProfileProps) {
  const { user } = useUser()

  if (!user) return null

  const id = React.useId()
  const [open, setOpen] = React.useState(false)

  const router = useRouter()

  const { update } = useSession()

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onChange',
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      avatar: user.image ? new File([], user.image) : null,
      background: user.background ? new File([], user.background) : null,
    },
  })

  const { mutateAsync: updateProfileFn } = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      await update({
        trigger: 'update',
        data,
      })

      toast('Perfil atualizado com sucesso!', {
        duration: 3000,
        position: 'top-center',
      })
      router.refresh()
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil', {
        duration: 3000,
        position: 'top-center',
      })
    },
  })

  const onFileChange = (name: 'avatar' | 'background', file: File | null) => {
    form.setValue(name, file)
    form.clearErrors(name)

    if (file) {
      form.trigger(name)
    }
  }

  const maxLengthForBio = 180

  const { characterCount, handleChange } = useCharacterLimit({
    maxLengthForBio,
    initialValue: user.bio || '',
  })

  const handleProfileUpdate = async ({
    name,
    bio,
    avatar,
    background,
  }: z.infer<typeof updateProfileSchema>) => {
    const formData = new FormData()

    formData.append('name', name)
    formData.append('bio', bio)

    if (avatar) formData.append('avatar', avatar)
    if (background) formData.append('background', background)

    await updateProfileFn(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <div
          data-dialog={open ? 'open' : 'closed'}
          className="fixed inset-0 z-50 backdrop-blur-sm data-[dialog=closed]:hidden"
          aria-hidden="true"
        />
      </DialogPortal>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <UserPen />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3"
        onPointerDownOutside={(ev) => {
          ev.preventDefault()
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-2 p-5">
          <DialogTitle>Editar perfil</DialogTitle>
          {form.formState.errors.background && (
            <span className="text-xs text-red-600">
              {form.formState.errors.background?.message}
            </span>
          )}
          <DialogDescription className="sr-only">
            Faça alterações no seu perfil aqui. Você pode alterar seu nome,
            fotos e biografia.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleProfileUpdate)}
            id="update-profile-form"
          >
            <BackgroundProfile onFileChange={onFileChange} />
            <AvatarProfile
              onFileChange={onFileChange}
              error={form.formState.errors.avatar?.message}
            />
            <div className="my-6 px-3">
              <FormField
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormItem className="mb-5">
                    <div className="group relative space-y-2">
                      <FormLabel
                        className={cn(
                          'className="origin-start has-[+input:not(:placeholder-shown)]:font-medium" absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:text-foreground',
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
                    <div className="group space-y-2">
                      <FormLabel>
                        <span
                          className={cn(
                            'inline-flex bg-muted px-2 dark:bg-background',
                            {
                              'text-red-500': fieldState.error,
                            },
                          )}
                        >
                          Biografia
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="max-h-36"
                          placeholder="Escreva uma biografia para o seu perfil"
                          aria-describedby={`${id}-description`}
                          {...rest}
                          onChange={(ev) => {
                            onChange(ev)
                            handleChange(ev)
                          }}
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
          </form>
        </Form>
        <footer className="mt-4 flex flex-row justify-between gap-2 border-t p-6">
          <Button
            form="update-profile-form"
            type="submit"
            className="min-w-[9.375rem] rounded-2xl font-semibold"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? (
              <>Salvando...</>
            ) : (
              <>Salvar alterações</>
            )}
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="rounded-2xl border font-semibold text-red-600 hover:border hover:border-red-600 hover:bg-transparent hover:text-red-600"
            >
              Cancelar
            </Button>
          </DialogClose>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
