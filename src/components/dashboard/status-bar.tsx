"use client";

import Image from "next/image";

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function timeUntil(date: string): string {
  const s = Math.floor((new Date(date).getTime() - Date.now()) / 1000);
  if (s < 0) return "soon";
  if (s < 60) return "< 1m";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function StatusBar({
  activeMonitors,
  hasErrors,
  errorCount = 0,
  lastCheckAt,
  nextCheckAt,
}: {
  activeMonitors: number;
  recentChanges: number;
  hasErrors: boolean;
  errorCount?: number;
  lastCheckAt?: string;
  nextCheckAt?: string;
}) {
  if (hasErrors) {
    const msg = errorCount === 1
      ? "One monitor is having trouble. Camo is retrying."
      : `${errorCount} monitors are having trouble. Camo is retrying.`;
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-sm bg-destructive/10 border border-destructive/20">
        <Image src="/assets/camo-watch.webp" alt="Camo" width={24} height={24} />
        <p className="text-sm text-muted-foreground flex-1">{msg}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-sm bg-primary/5 border border-primary/10">
      <Image src="/assets/camo-happy.webp" alt="Camo" width={24} height={24} />
      <div className="flex items-center gap-3 flex-1 text-sm text-muted-foreground">
        {lastCheckAt && <span>Last check: {timeAgo(lastCheckAt)}</span>}
        {lastCheckAt && nextCheckAt && <span className="text-muted-foreground/30">|</span>}
        {nextCheckAt && <span>Next: {timeUntil(nextCheckAt)}</span>}
      </div>
      {activeMonitors > 0 && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Live
        </span>
      )}
    </div>
  );
}
