interface NewsErrorProps {
  title: string
  message: string
}

export function NewsError({ title, message }: NewsErrorProps) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
      <h3 className="mb-2 text-base font-medium text-destructive">{title}</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
