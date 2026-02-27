import type { UIMessage } from 'ai'
import { RotateCcw } from 'lucide-react'

import { CopyTextComponent } from '@/components/copy-text-component'
import { useChatInstance } from '@/context/chat'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface MessageProps {
  message: UIMessage & Partial<ChatMessageType>
}

export function MessageActionFooter({ message }: MessageProps) {
  const { onRegenerateResponse, messages } = useChatInstance()

  const lastAssistantMessage = messages.findLast((m) => m.role === 'assistant')
  const isLastAssistantMessage = lastAssistantMessage?.id === message.id

  const textoForCopy = message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')

  return (
    <div className="flex items-center justify-center gap-1">
      <CopyTextComponent
        textForCopy={textoForCopy}
        iconPosition="right"
        iconSize={12}
        className="flex size-5 cursor-pointer items-center justify-center rounded-md opacity-0 duration-300 hover:bg-muted hover:text-foreground group-hover/container-wrapper:opacity-100"
      />
      {message.role === 'assistant' && isLastAssistantMessage && (
        <div
          onClick={() => onRegenerateResponse()}
          className="flex size-5 cursor-pointer items-center justify-center rounded-md opacity-0 duration-300 hover:bg-muted hover:text-primary group-hover/container-wrapper:opacity-100"
        >
          <RotateCcw className="size-3.5" />
        </div>
      )}
    </div>
  )
}
