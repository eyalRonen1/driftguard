"use client";

import { useEffect } from "react";
import { useChatContext } from "./chat-context";

/**
 * Drop this into any page that should NOT have monitor-specific chat context.
 * Clears the context so Camo doesn't talk about the wrong page.
 */
export function ClearChatContext() {
  const { setPageContext } = useChatContext();
  useEffect(() => {
    setPageContext({});
  }, [setPageContext]);
  return null;
}
