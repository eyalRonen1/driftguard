"use client";

import Image from "next/image";

/**
 * Global status bar - shows at the top of dashboard.
 * Camo's mood changes based on system status.
 */
export function StatusBar({
  activeMonitors,
  recentChanges,
  hasErrors,
  errorCount = 0,
}: {
  activeMonitors: number;
  recentChanges: number;
  hasErrors: boolean;
  errorCount?: number;
}) {
  const mood = hasErrors ? "worried" : recentChanges > 0 ? "alert" : "happy";

  const messages = {
    happy: [
      "All quiet in the jungle. No changes detected.",
      "Camo is chilling. Everything looks stable.",
      "Your pages are behaving. Camo approves.",
    ],
    alert: [
      `Camo spotted ${recentChanges} change${recentChanges > 1 ? "s" : ""}! Check the timeline.`,
      `${recentChanges} page${recentChanges > 1 ? "s" : ""} changed. Camo's on it.`,
    ],
    worried: errorCount === 1
      ? [
          "One monitor is having trouble reaching its page. Camo is retrying automatically.",
          "One site is not responding. Camo will keep trying — no action needed yet.",
        ]
      : errorCount > 1
      ? [
          `${errorCount} monitors are having trouble. This is usually temporary — Camo will keep retrying.`,
          `${errorCount} sites are not responding right now. Check the monitor details for more info.`,
        ]
      : [
          "Some monitors are having trouble reaching their pages. Camo is retrying automatically.",
          "Connection issues detected. Camo will keep trying — this is usually temporary.",
        ],
  };

  const msg = messages[mood][Math.floor(Date.now() / 60000) % messages[mood].length];
  const camoImg = mood === "happy" ? "/assets/camo-happy.webp" : "/assets/camo-watch.webp";

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-sm transition-colors ${
      mood === "worried"
        ? "bg-destructive/10 border border-destructive/20"
        : mood === "alert"
        ? "bg-chart-2/10 border border-chart-2/20"
        : "bg-primary/5 border border-primary/10"
    }`}>
      <Image src={camoImg} alt="" width={28} height={28} className={mood === "alert" ? "animate-bounce" : ""} />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{msg}</p>
        {mood === "worried" && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            Click on a monitor to see what went wrong and what you can do.
          </p>
        )}
      </div>
      {activeMonitors > 0 && (
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
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
