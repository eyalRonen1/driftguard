"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Real-time connection indicator + live updates.
 * Shows a green dot when connected to Supabase Realtime.
 * Automatically refreshes data when changes are detected.
 */
export function RealtimeIndicator({ onUpdate }: { onUpdate?: () => void }) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "changes" },
        (payload) => {
          setLastEvent(`Change detected: ${new Date().toLocaleTimeString()}`);
          onUpdate?.();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "monitors" },
        (payload) => {
          setLastEvent(`Monitor updated: ${new Date().toLocaleTimeString()}`);
          onUpdate?.();
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <span className="relative flex h-1.5 w-1.5">
        {connected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${connected ? "bg-primary" : "bg-muted-foreground"}`} />
      </span>
      <span>{connected ? "Live" : "Connecting..."}</span>
      {lastEvent && <span className="text-[9px] opacity-50 ml-1">• {lastEvent}</span>}
    </div>
  );
}
