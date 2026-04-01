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
      accountFacts: `Tracking ${monitorsCount} pages. ${changesCount} changes detected. Plan: ${plan}. Monitors: ${monitorNamesKey || "none"}.`,
      recentChanges: recentChangeSummaries.slice(0, 5),
    });
  }, [monitorsCount, changesCount, plan, monitorNamesKey, changesKey, setPageContext]);

  return null;
}
