'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { UserPen } from 'lucide-react'
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
  DialogFooter,
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
import { useSessionUser } from '@/context/user'
import { useCharacterLimit } from '@/hooks/use-character-limit'
import { queryKeys } from '@/lib/query-client'
import { updateProfileSchema } from '@/schemas'
import { cn } from '@/utils/utils'

import { BackgroundProfile } from './avatar-background'
import { AvatarProfile } from './avatar-profile'

export function EditProfile() {
  const { user, setUser } = useSessionUser()

  if (!user) return null

  const id = React.useId()
  const [open, setOpen] = React.useState(false)

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
    mutationKey: queryKeys.profile.update(),

    onMutate: async (formData) => {
      const previousUser = { ...user }

      const name = formData.get('name') as string
      const bio = formData.get('bio') as string
      const avatar = formData.get('avatar') as File | null
      const background = formData.get('background') as File | null

      setUser((prev) => {
        return {
          ...prev,
          name: name || prev.name,
          bio: bio || prev.bio,
          image: avatar ? URL.createObjectURL(avatar as File) : prev.image,
          background: background
            ? URL.createObjectURL(background as File)
            : prev.background,
        }
      })

      return { previousUser }
    },

    onSuccess: async (data) => {
      await update({
        trigger: 'update',
        data,
      })

      toast.success('Perfil atualizado com sucesso!', {
        duration: 3000,
        position: 'top-center',
      })

      setOpen(false)
    },

    onError: (_error, _variables, context) => {
      setUser((prev) => {
        if (!prev) return user

        return context?.previousUser ?? prev
      })

      toast.error('Erro ao atualizar perfil', {
        duration: 3000,
        position: 'top-center',
      })
    },
  })

  const onFileChange = (
    name: 'avatar' | 'background',
    file: File | FileList | null,
  ) => {
    form.setValue(name, file as File)
    form.clearErrors(name)
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
        <Button variant="ghost" size="icon" className="mr-1">
          <UserPen />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-y-visible !rounded-xl bg-background p-0 max-md:max-w-[23.5rem] [&>button:last-child]:top-3 [&>button:last-child]:rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between gap-2 p-4">
          <DialogTitle>Editar perfil</DialogTitle>
          {form.formState.errors.background && (
            <span className="text-xs text-red-600">
              {form.formState.errors.background?.message}
            </span>
          )}
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
                  <FormItem className="group relative mb-5 space-y-2">
                    <FormLabel
                      className={cn(
                        'absolute top-[30%] block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground',
                      )}
                    >
                      <span
                        className={cn('inline-flex px-2 dark:bg-background', {
                          'text-red-500': fieldState.error,
                        })}
                      >
                        Nome
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder=" " {...field} />
                    </FormControl>
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
                          className={cn('inline-flex px-2 dark:bg-background', {
                            'text-red-500': fieldState.error,
                          })}
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
                        <span className="text-xs text-muted-foreground lg:text-sm">
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
        <DialogFooter className="mt-4 justify-between gap-2 border-t p-6">
          <Button
            form="update-profile-form"
            type="submit"
            className="min-w-[9.375rem] rounded-md font-semibold"
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
              className="rounded-md border font-semibold text-red-600 hover:border hover:border-red-600 hover:bg-transparent hover:text-red-600"
            >
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
