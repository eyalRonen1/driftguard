"use client";

import Image from "next/image";
import Link from "next/link";

interface Activity {
  id: string;
  monitorId?: string;
  type: "change" | "check" | "error" | "alert";
  message: string;
  timestamp: string;
  importance?: number;
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const ICONS = {
  change: { emoji: "🔄", color: "bg-chart-2/20 text-chart-2" },
  check: { emoji: "✓", color: "bg-primary/20 text-primary" },
  error: { emoji: "⚠", color: "bg-destructive/20 text-destructive" },
  alert: { emoji: "🔔", color: "bg-chart-1/20 text-chart-1" },
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <Image src="/assets/camo-happy.webp" alt="" width={40} height={40} className="mx-auto mb-2 opacity-50" />
        <p className="text-xs text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.slice(0, 8).map((a) => {
        const icon = ICONS[a.type];
        const content = (
          <>
            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 ${icon.color}`}>
              {icon.emoji}
            </span>
            <p className="text-xs text-muted-foreground flex-1 truncate group-hover:text-foreground transition">
              {a.message}
            </p>
            <span className="text-[9px] text-muted-foreground flex-shrink-0">{timeAgo(a.timestamp)}</span>
          </>
        );

        if (a.monitorId) {
          return (
            <Link key={a.id} href={`/dashboard/monitors/${a.monitorId}`} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/30 transition group">
              {content}
            </Link>
          );
        }

        return (
          <div key={a.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/30 transition group">
            {content}
          </div>
        );
      })}
    </div>
  );
}
