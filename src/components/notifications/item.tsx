import { Notification } from "@/types/notifications";
import { formatDistanceToNow } from "@/utils/format";

type NotificationItemProps = {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div
      className="flex items-start cursor-pointer justify-between rounded-lg border border-input bg-card p-1.5 text-xs hover:bg-primary/10"
    >
      <div className="flex flex-col justify-center gap-1">
        <div className="relative flex gap-0.5">
          <span>{notification.category}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground/90">
            {formatDistanceToNow(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm">{notification.content}</p>
      </div>
      {!notification.readAt && <div className="size-2 rounded-full mr-2 bg-emerald-500 my-auto" />}
    </div>
  )
}