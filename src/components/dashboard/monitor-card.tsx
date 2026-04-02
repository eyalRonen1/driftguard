"use client";

import Image from "next/image";
import Link from "next/link";
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
  lastCheckedAt: string | null;
  changesCount?: number;
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

function getDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch { return ""; }
}

export function MonitorCard({
  id, name, url, checkFrequency, healthStatus, isActive, lastCheckedAt, changesCount = 0,
  onPause, onResume, onCheck, onDelete,
}: MonitorCardProps) {
  const healthColor = healthStatus === "error" ? "destructive"
    : healthStatus === "unstable" ? "secondary"
    : "default";

  return (
    <Card className="card-lift overflow-hidden">
      <Link href={`/dashboard/monitors/${id}`} className="block p-4">
        <div className="flex items-start gap-3">
          {/* Favicon */}
          <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={getFaviconUrl(url)}
              alt=""
              width={20}
              height={20}
              className="rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{name}</h3>
              {/* Health indicator */}
              <span className="relative flex h-2 w-2 flex-shrink-0">
                {healthStatus === "healthy" && isActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  healthStatus === "error" ? "bg-destructive" :
                  healthStatus === "unstable" ? "bg-chart-2" :
                  isActive ? "bg-primary" : "bg-muted-foreground"
                }`} />
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{getDomain(url)}</p>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{checkFrequency}</Badge>
              {changesCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{changesCount} changes</Badge>
              )}
              {lastCheckedAt && (
                <span className="text-[10px] text-muted-foreground">{timeAgo(lastCheckedAt)}</span>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCheck?.(); }}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Check now
              </DropdownMenuItem>
              {isActive ? (
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPause?.(); }}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                  </svg>
                  Pause
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onResume?.(); }}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                  Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(); }} className="text-destructive">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>
    </Card>
  );
}
