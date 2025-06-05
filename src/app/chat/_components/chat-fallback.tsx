'use client'

import {
  ChevronDown,
  GlobeIcon,
  MicIcon,
  PlusIcon,
  SendIcon,
} from 'lucide-react'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import {
  AIButtonSubmit,
  AIForm,
  AIInputButton,
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { Skeleton } from '@/components/ui/skeleton'

import { Input } from '../../../components/ui/input'

export function ChatFallback() {
  return (
    <div className="flex h-full w-full flex-col rounded-md border">
      <ContainerWrapper className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
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
        <Input
          className="h-20 w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0 placeholder:text-xs placeholder:text-muted-foreground focus-visible:ring-0"
          disabled
          placeholder="Pergunte-me qualquer coisa..."
        />
        <AIInputToolbar className="bg-card p-2.5 transition-all max-sm:p-1.5">
          <AIInputTools className="gap-2">
            <AIInputButton disabled variant="outline">
              <PlusIcon size={16} />
            </AIInputButton>
            <AIInputButton disabled variant="outline">
              <MicIcon size={16} />
            </AIInputButton>
            <AIInputButton disabled variant="outline">
              <GlobeIcon size={16} />
              <span>Search</span>
            </AIInputButton>
            <Button variant="ghost" disabled>
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 w-16 rounded-sm" />
              <ChevronDown size={16} />
            </Button>
          </AIInputTools>

          <AIButtonSubmit disabled className="font-bold">
            <span className="transition-all max-sm:hidden">Enviar</span>
            <SendIcon size={16} />
          </AIButtonSubmit>
        </AIInputToolbar>
      </AIForm>
    </div>
  )
}
