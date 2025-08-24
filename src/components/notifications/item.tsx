import { Notification } from "@/types/notifications";
import { formatDistanceToNow } from "@/utils/format";

type NotificationItemProps = {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div
      className="flex items-start cursor-pointer justify-between rounded-lg border border-input bg-card p-2 text-xs hover:bg-primary/10 transition-colors"
    >
      <div className="flex flex-col justify-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{notification.category}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground/90">
            {formatDistanceToNow(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{notification.content}</p>
      </div>
      {!notification.readAt &&
        <div className="size-2 rounded-full mr-2 bg-emerald-500 my-auto" />
      }
    </div>
  )
}