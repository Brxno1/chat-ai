'use client'

import { useSessionUser } from "@/context/user"
import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "@/utils/format"
import { Check } from "lucide-react"
import { cn } from "@/utils/utils"

export function Notifications() {
  const { notifications } = useSessionUser()

  if (!notifications) return null

  const [isOpen, setIsOpen] = React.useState(false)

  const unreadNotifications = notifications.filter((notification) => !notification.readAt)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" className="relative border border-input" variant="ghost">
          <Bell size={16} />
          <p className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-white">
            {unreadNotifications.length > 9 ? (
              <span className="text-[11px]">9+</span>
            ) : (
              unreadNotifications.length
            )}
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-h-[620px] w-80 space-y-1.5 overflow-auto overflow-y-auto rounded-2xl bg-background p-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md"
        align="end"
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-input bg-card p-2 text-xs hover:bg-primary/10"
          >
            <div className="flex flex-col justify-center gap-2">
              <div className="relative flex gap-1">
                <span>{notification.category}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground/90">
                  {formatDistanceToNow(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm">{notification.content}</p>
            </div>
            <Button size="icon" variant="link" className="my-auto">
              <Check
                size={16}
                className={cn('text-green-400', {
                  'text-muted-foreground': notification.readAt,
                })}
              />
            </Button>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}