import { Loader2, Newspaper } from 'lucide-react'

import type { NewsArticle } from '@/types/news'

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  if (!article) return null

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background/70 p-3">
      <div className="border-b border-border pb-3 last:border-0 last:pb-0">
        <h3 className="mb-1 font-medium">{article.title}</h3>
        {article.description && (
          <p className="mb-2 text-sm text-muted-foreground">
            {article.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {article.source.name} •{' '}
            {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
          >
            <span>Ler mais</span>
            <span className="size-3">↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export function NewsLoading({ topic }: { topic: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[60%]">
      <div className="flex items-center gap-2">
        <div className="flex animate-pulse items-center justify-center rounded-full bg-primary/15 p-1.5">
          <Newspaper className="size-6 text-primary" />
        </div>
        <span className="text-xl font-medium text-muted-foreground">
          Notícias
        </span>
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span className="text-xs lg:text-sm">
            Buscando notícias sobre {topic}...
          </span>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={`news-skeleton-${i}`}
              className="space-y-2 rounded-md bg-background/50 p-3"
            >
              <div className="h-4 w-full animate-pulse rounded-md bg-primary/15" />
              <div className="h-3 w-3/4 animate-pulse rounded-md bg-primary/15" />
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-24 animate-pulse rounded-sm bg-primary/15" />
                <div className="h-6 w-16 animate-pulse rounded-md bg-primary/15" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-primary/10 p-3 text-card-foreground">
      <div className="flex items-center gap-2">
        <div className="flex animate-pulse items-center justify-center rounded-full bg-primary/15 p-1.5">
          <Newspaper className="size-6 text-primary" />
        </div>
        <span className="text-xl font-medium text-muted-foreground">
          Notícias
        </span>
      </div>

      <div className="h-12 w-full animate-pulse rounded-md bg-primary/15" />
    </div>
  )
}
