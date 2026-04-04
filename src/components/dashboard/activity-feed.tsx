"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Activity {
  id: string;
  monitorId?: string;
  monitorName?: string;
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

function importanceDot(score?: number) {
  if (!score || score < 4) return "bg-[var(--accent-jade)]";
  if (score < 7) return "bg-[var(--accent-gold)]";
  return "bg-[var(--accent-ruby)]";
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <Image src="/assets/camo-happy.webp" alt="" width={40} height={40} className="mx-auto mb-2 opacity-50" />
        <p className="text-xs text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {activities.slice(0, 8).map((a) => {
        const isOpen = expanded === a.id;

        return (
          <div key={a.id} className="rounded-lg hover:bg-muted/30 transition">
            {/* Collapsed row */}
            <button
              onClick={() => setExpanded(isOpen ? null : a.id)}
              className="flex items-center gap-2.5 px-3 py-2.5 w-full text-left"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${importanceDot(a.importance)}`} />
              <div className="flex-1 min-w-0">
                {a.monitorName && (
                  <span className="text-xs font-medium text-[var(--accent-jade)]">{a.monitorName}</span>
                )}
                <p className={`text-sm text-muted-foreground ${isOpen ? "" : "truncate"}`}>
                  {a.message}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(a.timestamp)}</span>
              <svg className={`w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-3 pb-3 pl-8">
                <p className="text-sm text-[var(--text-sage)] mb-3 leading-relaxed">{a.message}</p>
                {a.monitorId && (
                  <Link
                    href={`/dashboard/monitors/${a.monitorId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-jade)] hover:underline"
                  >
                    View monitor
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
