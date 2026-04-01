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
        `User has ${monitorsCount} monitored pages`,
        `${changesCount} changes detected total`,
        `Current plan: ${plan}`,
        ...(monitorNames.length > 0 ? [`Monitoring: ${monitorNames.join(", ")}`] : []),
      ],
    });
  }, [monitorsCount, changesCount, plan, monitorNames, setPageContext]);

  return null;
}
