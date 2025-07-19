import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronsUpDown,
  GlobeIcon,
  ImageUp,
  MoreVertical,
  SendIcon,
  StopCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { TypingText } from '@/components/animate-ui/text/typing'
import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { useSidebar } from '@/components/ui/sidebar'
import { useChatContext } from '@/context/chat'

import { models } from '../../models/definitions'

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
  } = useChatContext()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: '',
    },
  })

  const { isMobile } = useSidebar()

  return (
    <Form {...form}>
      <AIForm
        onSubmit={form.handleSubmit(onSubmitChat)}
        className="rounded-xl border border-input bg-card dark:bg-message"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="relative">
              <FormControl>
                <Input
                  name="message"
                  autoFocus={status === 'ready'}
                  className="h-14 resize-none border-none shadow-none outline-none ring-0 transition-all duration-300 focus-visible:ring-0 sm:h-16"
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
                  className="pointer-events-none absolute left-3 top-[37%] -translate-y-1/2 text-sm text-muted-foreground transition-all duration-300"
                  text="Escreva para enviar uma mensagem..."
                  loop
                />
              )}
            </FormItem>
          )}
        />
        <AIInputToolbar className="p-3">
          <AIInputTools>
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled>
                    <ImageUp size={16} className="mr-2" />
                    <span>Imagem</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <GlobeIcon size={16} className="mr-2" />
                    <span>Busca</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <AIInputButton
                  variant={'outline'}
                  className="bg-card dark:bg-message"
                >
                  <ImageUp size={16} />
                </AIInputButton>
                <AIInputButton
                  disabled
                  variant={'outline'}
                  className="bg-card dark:bg-message"
                >
                  <GlobeIcon size={16} />
                </AIInputButton>
              </div>
            )}
            <AIInputModelSelect
              value={model.name}
              onValueChange={onModelChange}
            >
              <AIInputModelSelectTrigger
                className="gap-1 border-none px-1.5 text-xs transition-all sm:text-sm"
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
              size="lg"
            >
              <span className="flex items-center gap-2 font-bold">
                Parar
                <StopCircle size={16} />
              </span>
            </AIButtonSubmit>
          ) : input ? (
            <AIButtonSubmit
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              <span className="flex items-center gap-1.5 font-bold">
                Enviar
                <SendIcon size={16} />
              </span>
            </AIButtonSubmit>
          ) : (
            <AIVoiceInput />
          )}
        </AIInputToolbar>
      </AIForm>
    </Form>
  )
}
