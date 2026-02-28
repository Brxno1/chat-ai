import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronsUpDown,
  Files,
  Ghost,
  Paperclip,
  SendIcon,
  StopCircle,
} from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  AIForm,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { Switch } from '@/components/ui/switch'
import { useChatInstance } from '@/context/chat'
import { useMultipleUploads } from '@/hooks/use-multiple-uploads'
import { useChatStore } from '@/store/chat'
import { cn } from '@/utils/utils'

import { models } from '../models/definitions'
import { ModelTierIcon } from '../models/model-tier-icon'
import { ImagePreview } from './image-preview'
import { RecorderAudio } from './recorder-audio'

const schema = z.object({
  message: z.string().optional(),
  files: z
    .array(
      z.instanceof(File, {
        message: 'Por favor, selecione um arquivo válido',
      }),
    )
    .refine(
      (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
      `${Files.length > 1 ? 'Os arquivos devem ter no máximo 10MB cada' : 'O arquivo deve ter no máximo 10MB'}`,
    )
    .optional()
    .nullable(),
  audio: z
    .instanceof(File, {
      message: 'Por favor, selecione um arquivo válido',
    })
    .optional()
    .nullable(),
})

export function ChatForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      message: '',
      files: null,
      audio: null,
    },
  })

  const {
    files,
    images,
    fileInputRef,
    handleThumbnailClick,
    validateAndProcessFileInput,
    handleRemoveAll,
    handleRemoveItem,
  } = useMultipleUploads()

  const {
    input,
    status,
    model,
    onSubmitChat,
    onModelChange,
    onInputChange,
    onStop,
    buttonSubmitRef,
    inputRef,
  } = useChatInstance()

  const isGhostChatMode = useChatStore((state) => state.isGhostChatMode)

  const onRemoveItem = (index: number) => {
    handleRemoveItem(index)

    if (files.length <= 1) {
      form.setValue('files', null)
    }

    const remainingFiles = [...files]
    remainingFiles.splice(index, 1)
    form.setValue('files', remainingFiles)
  }

  const handleSubmit = ({ files, audio }: z.infer<typeof schema>) => {
    const allFiles: File[] = []

    if (files && files.length > 0) {
      allFiles.push(...files)
      handleRemoveAll()
    }

    if (audio && audio.size > 0) {
      allFiles.push(audio)
    }

    onSubmitChat(undefined, {
      files: allFiles.length > 0 ? allFiles : undefined,
    })

    form.reset()
  }

  const onSetAudio = (audio: File) => {
    form.setValue('audio', audio)
  }

  React.useEffect(() => {
    if (files.length > 0) {
      form.setValue('files', files)
    }
  }, [files, form])

  const hasFile = files.length > 0 || form.watch('audio')
  const hasImageToPreview = images.length > 0

  return (
    <Form {...form}>
      <AIForm
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          '!m-0 flex flex-col overflow-y-auto rounded-md border border-input bg-sidebar',
          isGhostChatMode && 'border-dashed',
        )}
      >
        {hasImageToPreview && (
          <ImagePreview
            className="size-14 p-2 pb-0"
            images={images}
            onRemoveItem={onRemoveItem}
          />
        )}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <AIInputTextarea
                  name="message"
                  ref={inputRef}
                  className="min-h-[40px] resize-none border-none bg-transparent pb-0 pt-4 shadow-none focus-visible:ring-0"
                  placeholder="Digite sua mensagem..."
                  autoFocus={status === 'ready'}
                  disabled={status === 'streaming'}
                  value={input}
                  onChange={(ev) => {
                    field.onChange(ev)
                    onInputChange(ev)
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <AIInputToolbar className="flex w-full items-center justify-between gap-2 pb-2 pt-1">
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem className="shrink-0">
                <FormControl>
                  <AIInputButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleThumbnailClick}
                  >
                    <Paperclip className="size-4 text-muted-foreground" />
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={(ev) => {
                        validateAndProcessFileInput(ev)
                        field.onChange(
                          ev.target.files ? Array.from(ev.target.files) : [],
                        )
                      }}
                      className="absolute inset-0 z-10 hidden"
                      accept="image/*"
                      multiple
                      aria-label="Carregar arquivo de imagem"
                    />
                  </AIInputButton>
                </FormControl>
              </FormItem>
            )}
          />
          <AIInputTools className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
            <AIInputModelSelect value={model.id} onValueChange={onModelChange}>
              <AIInputModelSelectTrigger
                className="w-auto shrink-0 border-none text-sm text-muted-foreground transition-all"
                disabled={status === 'streaming'}
              >
                <p className="hidden max-w-[8rem] items-center gap-0.5 sm:flex">
                  <span className="truncate">{model.name}</span>
                  <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                </p>
                <ModelTierIcon
                  tier={model.tier}
                  className="size-4 text-muted-foreground sm:hidden"
                />
              </AIInputModelSelectTrigger>
              <AIInputModelSelectContent
                className="bg-card"
                footer={<TemporaryChatSwitch />}
                align="end"
              >
                {models.map((m) => (
                  <AIInputModelSelectItem
                    value={m.id}
                    key={m.id}
                    data-active={m.id === model.id}
                    className="flex cursor-pointer flex-row items-center text-sm data-[active=true]:cursor-default data-[active=true]:bg-primary/10"
                    disabled={m.disabled}
                  >
                    <Image
                      src={`https://img.logo.dev/${m.provider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
                      alt={m.provider}
                      className="mr-2 inline-flex size-4 rounded-sm"
                      width={16}
                      height={16}
                    />
                    <span
                      className={cn(
                        m.premium &&
                          'bg-gradient-to-r from-[#fc1789] via-[#751dce] to-[#5bccfc] bg-clip-text font-bold text-transparent',
                      )}
                    >
                      {m.name}
                    </span>
                  </AIInputModelSelectItem>
                ))}
              </AIInputModelSelectContent>
            </AIInputModelSelect>
            {status === 'streaming' ? (
              <Button
                onClick={onStop}
                type="button"
                variant="default"
                className="text-md min-w-[3rem] rounded-md font-bold"
                size="icon"
              >
                <StopCircle size={16} />
              </Button>
            ) : input || hasFile ? (
              <Button
                ref={buttonSubmitRef}
                disabled={form.formState.isSubmitting}
                type="submit"
                size="icon"
                className="text-md min-w-[3rem] rounded-md font-bold"
              >
                <SendIcon size={16} />
              </Button>
            ) : (
              <RecorderAudio
                onSetAudio={onSetAudio}
                isSubmitting={form.formState.isSubmitting}
              />
            )}
          </AIInputTools>
        </AIInputToolbar>
      </AIForm>
    </Form>
  )
}

function TemporaryChatSwitch() {
  const defineChatToGhostMode = useChatStore(
    (state) => state.defineChatToGhostMode,
  )
  const isGhostChatMode = useChatStore((state) => state.isGhostChatMode)

  return (
    <div className="flex w-full items-center justify-between rounded-md p-2 text-sm transition-colors hover:bg-accent">
      <label htmlFor="ghost-mode-switch" className="flex items-center gap-2">
        <Ghost size={16} className="text-muted-foreground" />
        Conversa temporária
      </label>
      <Switch
        id="ghost-mode-switch"
        checked={isGhostChatMode}
        onCheckedChange={() => defineChatToGhostMode((prev) => !prev)}
        aria-label="Conversa temporária"
      />
    </div>
  )
}
