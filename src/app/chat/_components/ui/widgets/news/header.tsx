import { Newspaper } from 'lucide-react'

export function NewsHeader({ topic }: { topic: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center rounded-full bg-primary/15 p-1.5">
        <Newspaper className="size-6 text-primary" />
      </div>
      <span className="text-xl font-medium text-muted-foreground">
        Notícias sobre {topic}
      </span>
    </div>
  )
}
