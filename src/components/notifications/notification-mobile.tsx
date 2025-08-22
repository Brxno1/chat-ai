'use client'

import { useSessionUser } from "@/context/user"
import React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetHeader, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { UnreadNotification } from "./unread"
import { ReadNotification } from "./read"
import { CountNotifications } from "./count"

export function NotificationsMobile() {
  const { notifications, user } = useSessionUser()

  if (!notifications || !user) return null

  const [isOpen, setIsOpen] = React.useState(false)

  const unreadNotifications = notifications.filter((notification) => !notification.readAt)
  const readNotifications = notifications.filter((notification) => notification.readAt)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div
        data-open={isOpen}
        className="fixed inset-0 z-50 backdrop-blur-sm data-[open=false]:hidden"
        aria-hidden="true"
      />
      <SheetTrigger asChild>
        <Button size="icon" className="relative border border-input" variant="ghost">
          <Bell size={16} />
          <CountNotifications total={unreadNotifications.length} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="max-h-[45.80rem] rounded-2xl p-1 border border-input"
      >
        <SheetHeader className="mt-2">
          <SheetTitle>Notificações</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="unread">
          <TabsList className="grid w-full mt-2 grid-cols-2 bg-card [&>button[data-state=active]]:bg-primary [&>button[data-state=active]]:text-primary-foreground">
            <TabsTrigger value="unread">
              Novas {notifications.length > 0 && `(${unreadNotifications.length})`}
            </TabsTrigger>
            <TabsTrigger value="read">Lidas {notifications.length > 0 && `(${readNotifications.length})`}</TabsTrigger>
          </TabsList>
          <UnreadNotification unreadNotifications={unreadNotifications} setIsOpen={setIsOpen} />
          <ReadNotification readNotifications={readNotifications} setIsOpen={setIsOpen} />
        </Tabs>
        <SheetFooter className="mt-4 p-1.5 grid grid-cols-2 gap-2">
          <Button variant="ghost" className="border border-input">
            Ler todas
          </Button>
          <SheetClose asChild>
            <Button variant="ghost" className="border border-input">
              Fechar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}