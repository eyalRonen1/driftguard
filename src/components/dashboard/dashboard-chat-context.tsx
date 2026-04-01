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

  useEffect(() => {
    setPageContext({
      monitorName: undefined,
      monitorUrl: undefined,
      recentChanges: [
        `This user is tracking EXACTLY ${monitorsCount} pages (not 3, not a guess - exactly ${monitorsCount})`,
        `Total changes detected: ${changesCount}`,
        `Current plan: ${plan} (this is their ACTUAL plan, not the default)`,
        ...(monitorNames.length > 0 ? [`Pages being monitored: ${monitorNames.join(", ")}`] : []),
      ],
    });
  }, [monitorsCount, changesCount, plan, monitorNames, setPageContext]);

  return null;
}
