import { Notification } from "@/types/notifications";
import { TabsContent } from "../ui/tabs";
import { NotificationItem } from "./item";
import { Button } from "../ui/button";

type ReadNotificationProps = {
  readNotifications: Notification[]
  setIsOpen: (isOpen: boolean) => void
}

export function ReadNotification({ readNotifications, setIsOpen }: ReadNotificationProps) {
  return (
    <TabsContent value="read" className="flex flex-col h-full">
      <div className="p-1 space-y-1.5 max-h-[33.7875rem] overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
        {readNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
            Nenhuma notificação lida
          </div>
        ) : (
          readNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
      <footer className="grid grid-cols-1 gap-2 mt-2 p-2">
        <Button variant="ghost" onClick={() => setIsOpen(false)}>
          Fechar
        </Button>
      </footer>
    </TabsContent>
  )
}