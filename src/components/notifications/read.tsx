import { Notification } from "@/types/notifications";
import { TabsContent } from "../ui/tabs";
import { formatDistanceToNow } from "@/utils/format";

type ReadNotificationProps = {
  readNotifications: Notification[]
}

export function ReadNotification({ readNotifications }: ReadNotificationProps) {
  return (
    <TabsContent value="read" className="p-1 space-y-2 max-h-[34.6875rem] overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
      {readNotifications.length === 0 ? (
        <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
          Nenhuma notificação lida
        </div>
      ) : (
        readNotifications.map((notification) => (
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
          </div>
        ))
      )}
    </TabsContent>
  )
}