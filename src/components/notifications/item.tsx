import { Notification } from "@/types/notifications";
import { formatDistanceToNow } from "@/utils/format";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const DELETE_BUTTON_WIDTH = 56;

type NotificationItemProps = {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    // Snap: se passou do limiar, fixa exatamente na largura do botão
    if (info.offset.x <= -20) {
      setOffset(-DELETE_BUTTON_WIDTH);
    } else {
      setOffset(0);
    }
  };

  const handleDeleteNotification = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDragging) {
      return;
    }

    setOffset(() => 0);
  };

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="absolute right-0 h-full flex items-center"
        initial={{ x: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        animate={{
          x: offset < -15 ? 0 : 100,
          opacity: offset < -15 ? 1 : 0
        }}
      >
        <button
          className="bg-destructive h-full rounded-md px-4 flex items-center justify-center text-destructive-foreground"
          aria-label="Deletar notificação"
          onClick={handleDeleteNotification}
        >
          <Trash2 size={18} />
        </button>
      </motion.div>

      <motion.div
        className="flex items-start cursor-grab active:cursor-grabbing justify-between rounded-md border border-input bg-card p-1 text-xs transition-colors"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        animate={{ x: offset }}
        drag="x"
        dragConstraints={{ left: -DELETE_BUTTON_WIDTH, right: 0 }}
        dragElastic={false}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 20 }}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDrag={(_, info) => {
          const targetOffset = Math.min(0, Math.max(-DELETE_BUTTON_WIDTH, info.offset.x));

          if (offset <= -20 && targetOffset < offset) {
            return;
          }

          setOffset(targetOffset);
        }}
        onDragEnd={(event, info) => {
          setIsDragging(false);
          handleDragEnd(event, info);
        }}
      >
        <div className="flex flex-col justify-center gap-1">
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
      </motion.div>
    </div >
  )
}