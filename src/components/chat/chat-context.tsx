"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ChatPageContext {
  monitorName?: string;
  monitorUrl?: string;
  recentChanges?: string[];
}

const ChatContextValue = createContext<{
  pageContext: ChatPageContext;
  setPageContext: (ctx: ChatPageContext) => void;
}>({
  pageContext: {},
  setPageContext: () => {},
});

export function ChatContextProvider({ children }: { children: ReactNode }) {
  const [pageContext, setPageContext] = useState<ChatPageContext>({});
  return (
    <ChatContextValue.Provider value={{ pageContext, setPageContext }}>
      {children}
    </ChatContextValue.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContextValue);
}
