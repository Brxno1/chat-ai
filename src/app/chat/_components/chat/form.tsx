import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronsUpDown,
  GlobeIcon,
  ImageUp,
  SendIcon,
  StopCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { TypingText } from '@/components/animate-ui/text/typing'
import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  AIButtonSubmit,
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
})

export function ChatForm() {
  const {
    input,
    status,
    model,
    onSubmitChat,
    onModelChange,
    onInputChange,
    onStop,
    // onAttachImages,
  } = useChatContext()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: '',
    },
  })

  const {
    previewUrls,
    fileInputRef,
    handleThumbnailClick,
    validateAndProcessFileInput,
    handleRemoveItem,
    files,
    handleRemoveAll,
  } = useMultipleUploads()

  return (
    <Form {...form}>
      <AIForm
        onSubmit={form.handleSubmit(() => {
          const dataTransfer = new DataTransfer()
          files.forEach((file) => dataTransfer.items.add(file))
          
          onSubmitChat(undefined, {
            experimental_attachments: dataTransfer.files,
          })
          
          form.reset()
          handleRemoveAll()
        })}
        className="space-y-2 overflow-y-auto rounded-md border border-input bg-card dark:bg-message"
      >
        {previewUrls.length > 0 && (
          <ImagePreview
            previewUrls={previewUrls}
            onRemoveItem={handleRemoveItem}
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
                  className="h-14 resize-none !border-0 transition-all duration-300 focus-visible:ring-0 sm:h-16"
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
                  onChange={validateAndProcessFileInput}
                  className="absolute inset-0 z-10 hidden"
                  accept="image/*"
                  multiple
                  aria-label="Carregar arquivo de imagem"
                />
              </AIInputButton>

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
            <AIButtonSubmit
              onClick={onStop}
              type="button"
              variant="default"
              className="flex items-center"
              size="icon"
            >
              <StopCircle size={16} />
            </AIButtonSubmit>
          ) : input ? (
            <AIButtonSubmit
              disabled={form.formState.isSubmitting}
              type="submit"
              size="icon"
              className="flex items-center"
            >
              <SendIcon size={16} />
            </AIButtonSubmit>
          ) : (
            <AIVoiceInput />
          )}
        </AIInputToolbar>
      </AIForm>
    </Form>
  )
}
