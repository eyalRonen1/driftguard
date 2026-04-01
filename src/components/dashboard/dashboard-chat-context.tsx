"use client";

import { useEffect } from "react";
import { useChatContext } from "@/components/chat/chat-context";

/**
 * Sets chat context with dashboard-level data.
 * Rendered as a client component inside the server-rendered dashboard.
 */
export function DashboardChatContext({
  monitorsCount,
  changesCount,
  plan,
  monitorNames,
}: {
  monitorsCount: number;
  changesCount: number;
  plan: string;
  monitorNames: string[];
}) {
  const { setPageContext } = useChatContext();

  // Serialize array to a stable string so useEffect doesn't fire on every render
  const monitorNamesKey = monitorNames.join(",");

  useEffect(() => {
    setPageContext({
      monitorName: undefined,
      monitorUrl: undefined,
      recentChanges: [
        `This user is tracking EXACTLY ${monitorsCount} pages (not 3, not a guess - exactly ${monitorsCount})`,
        `Total changes detected: ${changesCount}`,
        `Current plan: ${plan} (this is their ACTUAL plan, not the default)`,
        ...(monitorNamesKey ? [`Pages being monitored: ${monitorNamesKey}`] : []),
      ],
    });
  }, [monitorsCount, changesCount, plan, monitorNamesKey, setPageContext]);

  return null;
}
