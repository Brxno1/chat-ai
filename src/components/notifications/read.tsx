import { Notification } from "@/types/notifications";
import { NotificationItem } from "./item";
import { Button } from "../ui/button";

type ReadNotificationProps = {
  readNotifications: Notification[]
  setIsOpen: (isOpen: boolean) => void
}

export function ReadNotification({ readNotifications, setIsOpen }: ReadNotificationProps) {
  return (
    <>
      <div className="p-1 space-y-1.5 max-h-[35.6260rem] overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
        {readNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
            <p>Nenhuma notificação lida</p>
          </div>
        ) : (
          readNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
      <footer className="grid grid-cols-2 gap-2 mt-2 p-2">
        <Button
          disabled={readNotifications.length === 0}
          className="transition-all hover:bg-primary/90"
        >
          Limpar todas
        </Button>
        <Button
          variant="ghost"
          onClick={() => setIsOpen(false)}
          className="transition-all"
        >
          Fechar
        </Button>
      </footer>
    </>
  )
}