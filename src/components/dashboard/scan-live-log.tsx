"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

/**
 * Live Scan Log - shows scan progress in real-time.
 * Terminal-style log with auto-scroll.
 */
export function ScanLiveLog({ entries }: { entries: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries.length]);

  if (entries.length === 0) return null;

  const typeColors = {
    info: "text-muted-foreground",
    success: "text-primary",
    warning: "text-chart-2",
    error: "text-destructive",
  };

  const typeIcons = {
    info: "›",
    success: "✓",
    warning: "⚠",
    error: "✗",
  };

  return (
    <div className="card-glass rounded-xl overflow-hidden border border-border/30">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20 bg-muted/20">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-destructive/60" />
          <div className="w-2 h-2 rounded-full bg-chart-2/60" />
          <div className="w-2 h-2 rounded-full bg-primary/60" />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">scan.log</span>
        <Image src="/assets/camo-watch.png" alt="" width={16} height={16} className="ml-auto animate-pulse" />
      </div>
      <div ref={scrollRef} className="p-3 max-h-[200px] overflow-y-auto font-mono text-xs space-y-0.5">
        {entries.map((entry, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-muted-foreground/50 select-none w-[50px] flex-shrink-0">{entry.time}</span>
            <span className={`select-none ${typeColors[entry.type]}`}>{typeIcons[entry.type]}</span>
            <span className={typeColors[entry.type]}>{entry.message}</span>
          </div>
        ))}
        <div className="flex gap-2 animate-pulse">
          <span className="text-muted-foreground/50 select-none w-[50px] flex-shrink-0" />
          <span className="text-primary">▋</span>
        </div>
      </div>
    </div>
  );
}
