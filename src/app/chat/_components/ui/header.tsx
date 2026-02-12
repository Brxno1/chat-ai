"use client";

import { MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

import { SidebarTriggerComponentMobile } from "@/app/_components/sidebar/sidebar-trigger-mobile";
import { useSidebar } from "@/components/animate-ui/radix/sidebar";
import { DashboardPageHeader } from "@/components/dashboard";
import { Notifications } from "@/components/notifications";
import { NotificationsMobile } from "@/components/notifications/notification-mobile";
import { ToggleTheme } from "@/components/theme/toggle-theme";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useChatInstance } from "@/context/chat";
import { useChatStore } from "@/store/chat";

function ChatHeader() {
  const router = useRouter();
  const { isMobile } = useSidebar();

  const resetChatState = useChatStore((state) => state.resetChatState);

  const { messages, setMessages } = useChatInstance();

  const hasMessages = messages.length > 0;

  const handleCreateNewChat = () => {
    setMessages([]);
    resetChatState();
    router.push("/");
  };

  useHotkeys("shift+n", () => {
    if (!hasMessages) return;

    router.push("/");
    handleCreateNewChat();
  });

  return (
    <DashboardPageHeader className="flex w-full items-center justify-between border-b border-input bg-sidebar pb-[1rem]">
      <div className="ml-2 flex items-center gap-3 transition-all">
        <SidebarTriggerComponentMobile size="icon" variant="ghost" />
      </div>
      <div className="mr-2 flex items-center gap-2">
        {isMobile ? <NotificationsMobile /> : <Notifications />}
        <Separator orientation="vertical" className="h-6" />
        <TooltipWrapper
          content="Nova conversa (Shift+n)"
          asChild
          disabled={!hasMessages}
        >
          <Button
            onClick={handleCreateNewChat}
            size="icon"
            variant="ghost"
            className="border border-input"
            disabled={!hasMessages}
          >
            <Link href="/">
              <MessageSquarePlus className="size-6" />
            </Link>
          </Button>
        </TooltipWrapper>
        <Separator orientation="vertical" className="h-6" />
        <ToggleTheme />
      </div>
    </DashboardPageHeader>
  );
}

export { ChatHeader };
