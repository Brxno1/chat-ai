import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronsUpDown,
  GlobeIcon,
  ImageUp,
  SendIcon,
  StopCircle,
} from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { TypingText } from '@/components/animate-ui/text/typing'
import { AIVoiceInput } from '@/components/ui/ai-voice-input'
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
  AIInputModelSelectValue,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { useChatContext } from '@/context/chat'
import { useMultipleUploads } from '@/hooks/use-multiple-uploads'

import { models } from '../../models/definitions'
import { ImagePreview } from './image-preview'

const schema = z.object({
  message: z.string().min(1),
  attachments: z.union([
    z
      .instanceof(File, { message: 'Por favor, selecione um arquivo válido' })
      .refine(
        (file) => file.size <= 10 * 1024 * 1024,
        `O arquivo deve ter no máximo 10MB`,
      ),
    z
      .array(z.instanceof(File))
      .refine(
        (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
        `Os arquivos devem ter no máximo 10MB cada`,
      ),
    z.null(),
    z.undefined(),
  ]),
})

export function ChatForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      message: '',
      attachments: null,
    },
  })

  const {
    files,
    previewUrls,
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
  } = useChatContext()

  const onRemoveItem = (index: number) => {
    handleRemoveItem(index)

    if (files.length <= 1) {
      form.setValue('attachments', null)
    }

    const remainingFiles = [...files]
    remainingFiles.splice(index, 1)
    form.setValue('attachments', remainingFiles)
  }

  const handleSubmit = ({ message, attachments }: z.infer<typeof schema>) => {
    const formData = new FormData()

    formData.append('message', message)
    const dataTransfer = new DataTransfer()

    if (attachments) {
      if (Array.isArray(attachments)) {
        attachments.forEach((file) => formData.append('attachments', file))
        attachments.forEach((file) => dataTransfer.items.add(file))
      } else {
        formData.append('attachments', attachments)
      }
    }

    onSubmitChat(undefined, {
      experimental_attachments: dataTransfer.files,
    })

    form.reset()
    handleRemoveAll()
  }

  React.useEffect(() => {
    if (files.length > 0) {
      form.setValue('attachments', files)
    }
  }, [files, form])

  return (
    <Form {...form}>
      <AIForm
        onSubmit={form.handleSubmit(handleSubmit)}
        className="overflow-y-auto rounded-md border border-input bg-card dark:bg-message"
      >
        {previewUrls.length > 0 && (
          <ImagePreview
            className="size-14"
            previewUrls={previewUrls}
            onRemoveItem={onRemoveItem}
          />
        )}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="relative !border-0">
              <FormControl>
                <AIInputTextarea
                  name="message"
                  autoFocus={status === 'ready'}
                  className="h-14 resize-none !border-0 transition-all duration-300 focus-visible:ring-0"
                  disabled={status === 'streaming'}
                  value={input}
                  onChange={(ev) => {
                    field.onChange(ev)
                    onInputChange(ev)
                  }}
                />
              </FormControl>
              {!input && (
                <TypingText
                  className="pointer-events-none absolute left-2 top-[22%] -translate-y-1/2 text-sm text-muted-foreground transition-all duration-300"
                  text="Escreva para enviar uma mensagem..."
                  loop
                />
              )}
            </FormItem>
          )}
        />
        <AIInputToolbar className="p-2">
          <AIInputTools>
            <div className="flex items-center gap-1">
              <FormField
                control={form.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <AIInputButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleThumbnailClick}
                      >
                        <ImageUp className="size-4" />
                        <Input
                          type="file"
                          ref={fileInputRef}
                          onChange={(ev) => {
                            validateAndProcessFileInput(ev)
                            field.onChange(ev.target.files)
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

              <AIInputButton
                disabled
                variant="ghost"
                size="icon"
                className="bg-card dark:bg-message"
              >
                <GlobeIcon size={16} />
              </AIInputButton>
            </div>
            <AIInputModelSelect
              value={model.name}
              onValueChange={onModelChange}
            >
              <AIInputModelSelectTrigger
                className="gap-1 border-none px-1.5 text-sm transition-all"
                disabled={status === 'streaming'}
              >
                <AIInputModelSelectValue />
                <ChevronsUpDown size={16} />
              </AIInputModelSelectTrigger>
              <AIInputModelSelectContent className="bg-card">
                {models.map((m) => (
                  <AIInputModelSelectItem
                    value={m.name}
                    key={m.id}
                    disabled={m.disabled}
                    data-active={m.name === model.name}
                    className="cursor-pointer text-sm data-[active=true]:cursor-default data-[active=true]:bg-primary/10"
                  >
                    <Image
                      src={`https://img.logo.dev/${m.provider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
                      alt={m.provider}
                      className="mr-2 inline-flex size-4 rounded-sm"
                      width={16}
                      height={16}
                    />
                    <span>{m.name}</span>
                  </AIInputModelSelectItem>
                ))}
              </AIInputModelSelectContent>
            </AIInputModelSelect>
          </AIInputTools>
          {status === 'streaming' ? (
            <Button
              onClick={onStop}
              type="button"
              variant="default"
              className="text-md min-w-[3rem] rounded-lg font-bold"
              size="icon"
            >
              <StopCircle size={16} />
            </Button>
          ) : input ? (
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
              size="icon"
              className="text-md min-w-[3rem] rounded-lg font-bold"
            >
              <SendIcon size={16} />
            </Button>
          ) : (
            <AIVoiceInput />
          )}
        </AIInputToolbar>
      </AIForm>
    </Form>
  )
}
