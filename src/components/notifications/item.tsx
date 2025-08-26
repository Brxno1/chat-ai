import { Notification } from "@/types/notifications";
import { formatDistanceToNow } from "@/utils/format";
import { useState } from "react";
import { animate, motion } from "framer-motion";
import { Trash2 } from "lucide-react";

type NotificationItemProps = {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const deleteButtonWidth = 56;

  const handleDragEnd = (_, info: { offset: { x: number } }) => {
    if (info.offset.x < -20) {
      setOffset(-deleteButtonWidth);
    } else {
      setOffset(0);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Current offset:", offset);

    if (isDragging) {
      console.log("Blocking click during drag");
      return;
    }

    console.log("Starting return animation");
    setOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="absolute right-0 h-full flex items-center"
        initial={{ x: 10, opacity: 1 }}
        animate={{
          x: offset < -15 ? 0 : 100,
          opacity: offset < -15 ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
      >
        <button
          className="bg-red-500 h-full rounded-md px-4 flex items-center justify-center text-white"
          aria-label="Deletar notificação"
          onClick={handleDeleteClick}
        >
          <Trash2 size={18} />
        </button>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -30, right: 0 }}
        dragElastic={0.05}
        dragMomentum
        dragTransition={{ bounceStiffness: 800, bounceDamping: 20 }}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDrag={(_, info) => {
          const targetOffset = Math.min(0, Math.max(-50, info.offset.x));

          if (offset < -20 && targetOffset < offset) {
            return;
          }

          setOffset(targetOffset);
        }}
        onDragEnd={(event, info) => {
          setIsDragging(false);
          handleDragEnd(event, info);
        }}
        className="flex items-start cursor-grab active:cursor-grabbing justify-between rounded-md border border-input bg-card py-1 px-2 text-xs transition-colors"
        animate={{ x: offset }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
      </motion.div>
    </div >
  )
}