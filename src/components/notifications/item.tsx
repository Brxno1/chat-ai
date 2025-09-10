import { Notification } from "@/types/notifications";
import { formatDistanceToNow } from "@/utils/format";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const DELETE_BUTTON_WIDTH = 40;

type NotificationItemProps = {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (info: { offset: { x: number } }) => {
    setIsDragging(false);

    const dragRatio = 0.8;
    const adjustedOffset = info.offset.x * dragRatio;

    if (adjustedOffset <= -15) {
      setOffset(-DELETE_BUTTON_WIDTH);
    } else {
      setOffset(0);
    }
  };

  const handleDrag = (info: { offset: { x: number } }) => {
    const dragRatio = 0.8;
    const rawOffset = info.offset.x * dragRatio;
    const targetOffset = Math.min(0, Math.max(-DELETE_BUTTON_WIDTH, rawOffset));

    if (offset <= -15 && targetOffset < offset) {
      return;
    }

    setOffset(targetOffset);
  }


  const handleDeleteNotification = (event: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDragging) {
      return;
    }

    setOffset(() => 0);
  };

  return (
    <div className="relative overflow-hidden">
      <motion.button
        className="absolute right-0 h-full w-10 flex items-center bg-red-500 dark:bg-red-700 rounded-md justify-center text-white"
        initial={{ x: 20, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        onClick={handleDeleteNotification}
        animate={{
          x: offset < -15 ? 0 : 15,
          opacity: offset < -15 ? 1 : 0,
        }}
      >
        <Trash2 size={18} />
      </motion.button>

      <motion.div
        className="flex items-start cursor-pointer active:cursor-grabbing justify-between rounded-md border border-input bg-card p-1 text-xs transition-colors hover:bg-card/80"
        drag="x"
        initial={{ x: 0 }}
        animate={{
          x: offset,
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 50,
          mass: 0.5
        }}
        dragConstraints={{ left: -DELETE_BUTTON_WIDTH, right: 0 }}
        dragElastic={false}
        dragTransition={{
          power: 0.8,
          timeConstant: 150,
          modifyTarget: (target) => Math.round(target)
        }}
        onDragStart={() => setIsDragging(true)}
        onDrag={(_, info) => handleDrag(info)}
        onDragEnd={(_event, info) => handleDragEnd(info)}
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
        {!notification.readAt && (
          <motion.div
            className="size-2 rounded-full mr-2 bg-emerald-500 my-auto"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          />
        )}
      </motion.div>
    </div>
  )
}