'use client'

import { useSessionUser } from "@/context/user"
import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UnreadNotification } from "./unread"
import { ReadNotification } from "./read"
import { CountNotifications } from "./count"

export function Notifications() {
  const { notifications, user } = useSessionUser()

  if (!notifications || !user) return null

  const [isOpen, setIsOpen] = React.useState(false)

  const unreadNotifications = notifications.filter((notification) => !notification.readAt)
  const readNotifications = notifications.filter((notification) => notification.readAt)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" className="relative border border-input" variant="ghost">
          <Bell size={16} />
          <CountNotifications total={unreadNotifications.length} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-h-[45.80rem] rounded-2xl p-0.5 border border-input"
        align="end"
      >
        <header className="flex items-center justify-center w-full p-2">
          <h1 className="text-lg font-semibold">Notificações</h1>
        </header>
        <Tabs defaultValue="unread">
          <TabsList className="grid w-full grid-cols-2 bg-card [&>button[data-state=active]]:bg-primary [&>button[data-state=active]]:text-primary-foreground">
            <TabsTrigger value="unread">
              Novas {notifications.length > 0 && `(${unreadNotifications.length})`}
            </TabsTrigger>
            <TabsTrigger value="read">Lidas {notifications.length > 0 && `(${readNotifications.length})`}</TabsTrigger>
          </TabsList>
          <UnreadNotification unreadNotifications={unreadNotifications} setIsOpen={setIsOpen} />
          <ReadNotification readNotifications={readNotifications} setIsOpen={setIsOpen} />
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}