'use client'

import {
  ChevronDown,
  Ghost,
  GlobeIcon,
  MessageCirclePlus,
  MicIcon,
  PlusIcon,
  SendIcon
} from 'lucide-react'

import { ContainerWrapper } from '@/components/container'
import {
  AIForm,
  AIButtonSubmit,
  AIInputButton,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools
} from '@/components/ui/kibo-ui/ai/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { Historical } from './historical'
import { Input } from '../ui/input'

interface ChatFallbackProps {
  modelName: string
}

export function ChatFallback({ modelName }: ChatFallbackProps) {
  return (
    <div className="grid h-full w-full max-w-xl grid-rows-[3rem_1fr_auto] flex-col space-y-6 border border-border">
      <header className="sticky top-0 flex h-fit items-center justify-between border-b border-border bg-background p-3">
        <div className="flex gap-1">
          <Historical disabled />
          <Button variant="link" size="icon" disabled>
            <MessageCirclePlus size={16} />
          </Button>
          <Button variant="link" size="icon" disabled>
            <Ghost size={16} />
          </Button>
        </div>
        <Skeleton className="size-8 rounded-sm" />
      </header>

      <ContainerWrapper className="flex flex-col gap-3 overflow-y-auto p-4">
        <div className="mr-auto flex flex-col gap-3">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="ml-auto flex flex-col gap-3">
          <Skeleton className="h-20 w-64" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>

        <div className="mr-auto flex flex-col gap-3 overflow-y-auto p-4">
          <Skeleton className="h-28 w-64" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="ml-auto flex flex-col gap-3">
          <Skeleton className="h-20 w-64" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      </ContainerWrapper>

      <AIForm className="drop-shadow-md">
        <div className='relative'>
          <Input
            className="w-full h-20 resize-none rounded-none border-none p-3 shadow-none outline-none ring-0 focus-visible:ring-0"
            disabled
        />
        <span className='text-xs text-muted-foreground absolute left-3 top-7'>
            Digite sua mensagem...
          </span>
        </div>
        <AIInputToolbar className="p-2">
          <AIInputTools className="gap-2">
            <AIInputButton disabled variant={'outline'}>
              <PlusIcon size={16} />
            </AIInputButton>
            <AIInputButton disabled variant={'outline'}>
              <MicIcon size={16} />
            </AIInputButton>
            <AIInputButton disabled variant={'outline'}>
              <GlobeIcon size={16} />
              <span>Search</span>
            </AIInputButton>
            <Button variant={'outline'} disabled>
              <Image
                src={`https://img.logo.dev/openai.com?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}`}
                alt={modelName}
                className="inline-flex size-4 rounded-sm"
                width={16}
                height={16}
              />
              <span>{modelName}</span>
              <ChevronDown size={16} />
            </Button>
          </AIInputTools>

          <AIButtonSubmit variant={'outline'} disabled>
            <SendIcon size={16} />
          </AIButtonSubmit>
        </AIInputToolbar>
      </AIForm>
    </div>
  )
}
