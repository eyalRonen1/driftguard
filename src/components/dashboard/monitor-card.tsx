"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MonitorCardProps {
  id: string;
  name: string;
  url: string;
  checkFrequency: string;
  healthStatus: string;
  isActive: boolean;
  isPaused?: boolean;
  lastCheckedAt: string | null;
  nextCheckAt?: string | null;
  changesCount?: number;
  totalChecks?: number;
  tags?: string;
  busyLabel?: string;
  onPause?: () => void;
  onResume?: () => void;
  onCheck?: () => void;
  onDelete?: () => void;
}

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
  if (s < 3600) return `in ${Math.floor(s / 60)}m`;
  if (s < 86400) return `in ${Math.floor(s / 3600)}h`;
  return `in ${Math.floor(s / 86400)}d`;
}

function getDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function getFaviconUrl(url: string): string {
  try { return new URL(url).origin + "/favicon.ico"; } catch { return ""; }
}

const FREQ_LABELS: Record<string, string> = {
  "15min": "Every 15 min",
  "hourly": "Every hour",
  "every_6h": "Every 6h",
  "daily": "Daily",
  "weekly": "Weekly",
};

export function MonitorCard({
  id, name, url, checkFrequency, healthStatus, isActive, isPaused, lastCheckedAt, nextCheckAt,
  changesCount = 0, totalChecks = 0, tags, busyLabel, onPause, onResume, onCheck, onDelete,
}: MonitorCardProps) {
  const paused = isPaused || !isActive;
  const hasActions = onCheck || onPause || onResume || onDelete;
  const router = useRouter();
  const menuClosedAt = useRef(0);

  function navigateToMonitor() {
    // Block ghost taps that fire after dropdown closes on mobile
    if (Date.now() - menuClosedAt.current < 400) return;
    router.push(`/dashboard/monitors/${id}`);
  }

  return (
    <Card className={`card-lift overflow-hidden relative ${busyLabel ? "opacity-70 pointer-events-none" : ""} ${paused ? "opacity-60" : ""}`}>
      {busyLabel && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-xl">
          <div className="flex items-center gap-2 bg-[var(--bg-deep)]/90 px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5 animate-spin text-[var(--accent-jade)]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
            </svg>
            <span className="text-xs text-[var(--accent-jade)] font-medium">{busyLabel}</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4">
        {/* Clickable content area  - uses programmatic nav to avoid ghost-tap issues */}
        <div role="link" tabIndex={0} onClick={navigateToMonitor} onKeyDown={(e) => { if (e.key === "Enter") navigateToMonitor(); }} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 cursor-pointer">
          {/* Favicon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={getFaviconUrl(url)}
              alt=""
              width={22}
              height={22}
              className="rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          {/* Name + Domain  - flexible on mobile, fixed on desktop */}
          <div className="min-w-0 flex-1 sm:flex-none sm:w-[220px] lg:w-[280px]">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[15px] truncate">{name}</h3>
              {paused ? (
                <Badge variant="outline" className="text-[11px] px-2 py-0 text-[var(--accent-gold)] border-[var(--accent-gold)]/30 flex-shrink-0">
                  Paused
                </Badge>
              ) : (
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  {healthStatus === "healthy" && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    healthStatus === "error" ? "bg-destructive" :
                    healthStatus === "unstable" ? "bg-chart-2" : "bg-primary"
                  }`} />
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{getDomain(url)}</p>
          </div>

          {/* Frequency */}
          <Badge variant="outline" className="text-xs px-2.5 py-0.5 flex-shrink-0 hidden sm:inline-flex">
            {FREQ_LABELS[checkFrequency] || checkFrequency}
          </Badge>

          {/* Stats  - spread in middle */}
          {changesCount > 0 && (
            <span className="text-sm text-[var(--accent-jade)] flex-shrink-0 hidden md:inline">{changesCount} changes</span>
          )}
          {totalChecks > 0 && (
            <span className="text-sm text-muted-foreground flex-shrink-0 hidden md:inline">{totalChecks} checks</span>
          )}
          {tags && (
            <span className="text-sm text-muted-foreground/70 truncate max-w-[140px] hidden lg:inline">{tags}</span>
          )}

          {/* Spacer  - only on desktop where name has fixed width */}
          <div className="flex-1 hidden sm:block" />

          {/* Timing */}
          <div className="text-right flex-shrink-0">
            {lastCheckedAt && (
              <p className="text-sm text-muted-foreground whitespace-nowrap">{timeAgo(lastCheckedAt)}</p>
            )}
            {!paused && nextCheckAt && (
              <p className="text-xs text-muted-foreground/60 whitespace-nowrap">Next: {timeUntil(nextCheckAt)}</p>
            )}
          </div>
        </div>

        {/* Quick actions  - outside the clickable area, with ghost-tap guard */}
        {hasActions && (
          <DropdownMenu modal={false} onOpenChange={(open) => { if (!open) menuClosedAt.current = Date.now(); }}>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" />}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { onCheck?.(); }}>Check now</DropdownMenuItem>
              {paused ? (
                <DropdownMenuItem onClick={() => { onResume?.(); }}>Resume</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => { onPause?.(); }}>Pause</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { onDelete?.(); }} className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
}
