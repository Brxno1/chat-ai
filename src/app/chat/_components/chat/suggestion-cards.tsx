import { useChatInstance } from '@/context/chat'

export function SuggestionCard({ text }: { text: string }) {
  const { onInputChange, buttonSubmitRef } = useChatInstance()

  return (
    <div
      onClick={() => {
        const event = {
          target: { value: text },
          preventDefault: () => {},
        } as React.ChangeEvent<HTMLTextAreaElement>

        onInputChange(event)
        setTimeout(() => buttonSubmitRef?.current?.click(), 50)
      }}
      className="flex h-28 cursor-pointer items-center justify-center rounded-lg border border-input bg-card p-2.5 text-center text-sm shadow-md hover:bg-accent"
    >
      {text}
    </div>
  )
}
