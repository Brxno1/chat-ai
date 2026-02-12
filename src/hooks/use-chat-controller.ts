"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";

import { useSessionUser } from "@/context/user";
import { queryKeys } from "@/lib/query-client";
import { useChatStore } from "@/store/chat";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

type UseChatControllerProps = {
  initialMessages?: (UIMessage & Partial<ChatMessageType>)[] | undefined;
  currentChatId?: string | undefined;
  initialModel?: string;
};

export function useChatController({
  initialMessages,
  currentChatId,
}: UseChatControllerProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const setSuggestions = useChatStore((state) => state.setSuggestions);

  const { user } = useSessionUser();

  return useChat({
    id: currentChatId || useChatStore.getState().getChatInstanceKey(),
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: () => ({
        "x-user-name": user?.name || "",
        "x-user-id": user?.id || "",
        "x-chat-id": currentChatId || "",
        "x-ghost-mode": String(useChatStore.getState().isGhostChatMode),
        "x-ai-model": useChatStore.getState().model.id,
      }),
    }),
    onFinish: async () => {
      setSuggestions([]);

      if (!useChatStore.getState().isGhostChatMode) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.all,
        });

        if (!currentChatId) {
          const currentKey = useChatStore.getState().getChatInstanceKey();
          if (currentKey) {
            useChatStore.getState().defineChatInstanceKey(currentKey);
            router.push(`/chat/${currentKey}`);
          }
        }
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
