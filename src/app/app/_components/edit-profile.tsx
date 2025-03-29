'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { Edit, ImagePlusIcon, XIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCharacterLimit } from '@/hooks/use-character-limit'
import { useImageUpload } from '@/hooks/use-image-upload'
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
  bio: z.string().max(180, 'Biografia deve ter no máximo 180 caracteres'),
  avatar: z
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
  background: z
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

type FileFieldName = 'avatar' | 'background'

export default function EditProfile() {
  const session = useSession()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: session.data?.user?.name || '',
      email: session.data?.user?.email || '',
      bio: '',
      avatar: undefined,
      background: undefined,
    },
  })

  const [open, setOpen] = React.useState(false)

  const id = React.useId()

  const maxLength = 180
  const {
    value,
    characterCount,
    handleChange,
    maxLength: limit,
  } = useCharacterLimit({
    maxLength,
    initialValue: 'Escreva uma breve descrição sobre você...',
  })

  const handleFileChange =
    (fieldName: FileFieldName) => (file: File | null) => {
      if (file) {
        form.setValue(fieldName, file)
      }
    }

  const onUpdateProfile = ({
    name,
    email,
    bio,
    avatar,
    background,
  }: FormValues) => {
    const formData = new FormData()

    formData.append('name', name)
    formData.append('email', email)
    formData.append('bio', bio)
    if (avatar) {
      formData.append('avatar', avatar)
    }
    if (background) {
      formData.append('background', background)
    }

    toast(`${formData.get('name')} ✅`, {
      duration: 2000,
      position: 'top-center',
    })

    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(prevOpen) => {
        setOpen(prevOpen)
        if (!prevOpen) {
          form.reset()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className={cn('h-3 w-3 cursor-pointer')} />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Editar perfil
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Faça alterações no seu perfil aqui. Você pode alterar sua foto e
          definir um nome de usuário.
        </DialogDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onUpdateProfile)}
            className="space-y-4"
            id="update-profile-form"
          >
            <div className="overflow-y-auto">
              <ProfileBackground
                onFileChange={handleFileChange('background')}
              />
              <Avatar
                user={session.data?.user as User}
                onFileChange={handleFileChange('avatar')}
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
                        <Input
                          id="name"
                          type="text"
                          placeholder=" "
                          {...field}
                          defaultValue={session.data?.user?.name}
                        />
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <FormItem className="mb-3">
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
                        <Input
                          id={`${id}-email`}
                          className="pe-9"
                          placeholder="  "
                          defaultValue={session.data?.user?.email}
                          type="email"
                          required
                          {...field}
                        />
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <div className="*:not-first:mt-2">
                  <Label htmlFor={`${id}-bio`}>Biografia</Label>
                  <Textarea
                    id={`${id}-bio`}
                    placeholder="Escreva algumas frases sobre você"
                    defaultValue={value}
                    maxLength={maxLength}
                    onChange={handleChange}
                    aria-describedby={`${id}-description`}
                  />
                  <p
                    id={`${id}-description`}
                    className="mt-2 text-right text-xs text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="tabular-nums">
                      {limit - characterCount}
                    </span>{' '}
                    caracteres restantes
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="submit"
            className="font-semibold"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="update-profile-form"
          >
            Salvar alterações
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="font-semibold text-red-600 hover:text-red-600"
            >
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface FileUploadProps {
  onFileChange: (file: File | null) => void
}

function ProfileBackground({ onFileChange }: FileUploadProps) {
  const [_, setHideDefault] = React.useState(false)

  const {
    file,
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload()

  React.useEffect(() => {
    onFileChange(file)
  }, [file, onFileChange])

  const currentImage = previewUrl

  const handleImageRemove = () => {
    handleRemove()
    setHideDefault(true)
  }

  return (
    <div className="h-32">
      <ContainerWrapper className="relative flex h-full w-full items-center justify-center overflow-hidden border-b bg-black">
        {currentImage && (
          <img
            className="h-full w-full object-cover"
            src={currentImage}
            alt={''}
            width={512}
            height={96}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <Button
            type="button"
            className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={handleThumbnailClick}
            aria-label={currentImage ? 'Alterar imagem' : 'Carregar imagem'}
          >
            <ImagePlusIcon size={16} aria-hidden="true" />
          </Button>
          {currentImage && (
            <Button
              type="button"
              className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={handleImageRemove}
              aria-label="Remover imagem"
            >
              <XIcon size={16} aria-hidden="true" />
            </Button>
          )}
        </div>
      </ContainerWrapper>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(ev) => {
          const file = ev.target.files?.[0] || null
          handleFileChange(ev)
          onFileChange(file)
        }}
        className="hidden"
        accept="image/*"
        aria-label="Carregar arquivo de imagem"
      />
    </div>
  )
}

interface AvatarProps {
  user: User
  onFileChange: (file: File | null) => void
}

function Avatar({ user, onFileChange }: AvatarProps) {
  const {
    file,
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
  } = useImageUpload()

  React.useEffect(() => {
    onFileChange(file)
  }, [file, onFileChange])

  return (
    <div className="-mt-10 px-6">
      <div className="shadow-xs relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-black/10">
        <img
          src={previewUrl || user.image!}
          className="h-full w-full object-cover"
          width={80}
          height={80}
          alt="Imagem de perfil"
        />
        <Button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onClick={handleThumbnailClick}
          aria-label="Alterar imagem de perfil"
        >
          <ImagePlusIcon size={16} aria-hidden="true" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Carregar imagem de perfil"
        />
      </div>
    </div>
  )
}
