'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Edit, LoaderCircle } from 'lucide-react'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import React, { Suspense } from 'react'
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
import { cn } from '@/utils/utils'

import {
  BackgroundProfile,
  BackgroundProfileFallback,
} from './avatar-background'
import { AvatarProfile, AvatarProfileFallback } from './avatar-profile'

type FileChange = {
  name: 'avatar' | 'background'
  file: File | null
}

export default function EditProfile({ user }: { user: Session['user'] }) {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)

  const { update } = useSession()

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
    onSuccess: async (data) => {
      await update({
        trigger: 'update',
        data,
      })
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

  const handleCloseDialog = () => {
    setOpen((prev) => !prev)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-3 w-3 cursor-pointer" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[75vh] flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5"
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
            onSubmit={form.handleSubmit(handleUpdateProfile)}
            id="update-profile-form"
          >
            <Suspense fallback={<BackgroundProfileFallback />}>
              <BackgroundProfile
                Background={user.background}
                onFileChange={onFileChange}
              />
            </Suspense>
            <Suspense fallback={<AvatarProfileFallback user={user} />}>
              <AvatarProfile
                onFileChange={onFileChange}
                user={user}
                error={form.formState.errors.avatar?.message}
              />
            </Suspense>
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
            className="min-w-[150px] font-semibold"
            disabled={
              form.formState.isSubmitting ||
              isUpdating ||
              !form.formState.isValid
            }
          >
            {form.formState.isSubmitting ? (
              <LoaderCircle className="animate-spin font-semibold" />
            ) : (
              <>Salvar alterações</>
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
