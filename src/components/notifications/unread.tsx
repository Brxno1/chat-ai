import { Notification } from "@/types/notifications";
import { TabsContent } from "../ui/tabs";
import { NotificationItem } from "./item";
import { Button } from "../ui/button";

type UnreadNotificationProps = {
  unreadNotifications: Notification[]
  setIsOpen: (isOpen: boolean) => void
}

export function UnreadNotification({ unreadNotifications, setIsOpen }: UnreadNotificationProps) {
  return (
    <TabsContent value="unread" className="flex flex-col h-full">
      <div className="p-1 space-y-1.5 max-h-[33.7875rem] overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
        {unreadNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-2 text-sm text-muted-foreground">
            <p>Nenhuma notificação nova</p>
          </div>
        ) : (
          unreadNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
      <footer className="grid grid-cols-2 gap-2 mt-2 p-2">
        <Button disabled={unreadNotifications.length === 0}>
          Ler todas
        </Button>
        <Button variant="ghost" onClick={() => setIsOpen(false)}>
          Fechar
        </Button>
      </footer>
    </TabsContent>
  )
}