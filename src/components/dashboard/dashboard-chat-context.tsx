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
  recentChangeSummaries = [],
}: {
  monitorsCount: number;
  changesCount: number;
  plan: string;
  monitorNames: string[];
  recentChangeSummaries?: string[];
}) {
  const { setPageContext } = useChatContext();

  // Serialize arrays to stable strings so useEffect doesn't fire on every render
  const monitorNamesKey = monitorNames.join(",");
  const changesKey = recentChangeSummaries.join("|");

  useEffect(() => {
    setPageContext({
      monitorName: undefined,
      monitorUrl: undefined,
      recentChanges: [
        `This user is tracking EXACTLY ${monitorsCount} pages (not 3, not a guess - exactly ${monitorsCount})`,
        `Total changes detected: ${changesCount}`,
        `Current plan: ${plan} (this is their ACTUAL plan, not the default)`,
        ...(monitorNamesKey ? [`Pages being monitored: ${monitorNamesKey}`] : []),
        ...(recentChangeSummaries.length > 0
          ? [`Recent changes detected:\n${recentChangeSummaries.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join("\n")}`]
          : []),
      ],
    });
  }, [monitorsCount, changesCount, plan, monitorNamesKey, changesKey, setPageContext]);

  return null;
}
