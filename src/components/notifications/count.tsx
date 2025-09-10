interface CountNotifications {
  total: number
}

export function CountNotifications({ total }: CountNotifications) {
  return (
    <div
      data-notification={total >= 1}
      className="absolute hidden -right-1 -top-1 size-4 items-center justify-center rounded-full bg-red-600 text-destructive-foreground data-[notification=true]:flex"
    >
      {total > 9 ? (
        <span className="text-[11px]">9+</span>
      ) : (
        total
      )}
    </div>
  )
}