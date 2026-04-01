"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Change {
  id: string;
  summary: string;
  changeType: string;
  importanceScore: number;
  createdAt: string;
  addedText?: string | null;
  removedText?: string | null;
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export function ChangeTimeline({ changes }: { changes: Change[] }) {
  if (changes.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center">
          <Image src="/assets/camo-sleep.png" alt="" width={72} height={72} className="mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No changes yet. Camo is watching.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

      <div className="space-y-3">
        {changes.map((change, i) => (
          <ChangeCard key={change.id} change={change} isFirst={i === 0} />
        ))}
      </div>
    </div>
  );
}

function ChangeCard({ change, isFirst }: { change: Change; isFirst: boolean }) {
  const [open, setOpen] = useState(false);

  const importanceColor = change.importanceScore >= 7
    ? "destructive" as const
    : change.importanceScore >= 4
    ? "secondary" as const
    : "outline" as const;

  const dotColor = change.importanceScore >= 7
    ? "bg-destructive shadow-[0_0_8px_var(--destructive)]"
    : change.importanceScore >= 4
    ? "bg-chart-2 shadow-[0_0_8px_var(--chart-2)]"
    : "bg-primary shadow-[0_0_8px_var(--primary)]";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex gap-3 relative">
        {/* Dot */}
        <div className="flex-shrink-0 relative z-10 mt-3">
          <div className={`w-[10px] h-[10px] rounded-full ${dotColor} ring-2 ring-background`} />
        </div>

        {/* Card */}
        <Card className="flex-1 border-border/50 hover:border-primary/20 transition-colors">
          <CollapsibleTrigger>
            <CardContent className="p-4 cursor-pointer text-left w-full">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">
                    {change.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge variant={importanceColor} className="text-[10px] px-1.5 py-0">
                      {change.importanceScore}/10
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {change.changeType}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(change.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isFirst && (
                    <Image src="/assets/camo-watch.png" alt="" width={24} height={24} className="opacity-60" />
                  )}
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 mt-0 pt-3">
              {/* Visual diff */}
              {(change.addedText || change.removedText) ? (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <div className="p-3 space-y-1.5 font-mono text-xs">
                    {change.removedText && (
                      <div className="px-2 py-1.5 rounded bg-destructive/10 border-l-2 border-destructive/40">
                        <span className="text-destructive font-bold mr-2">−</span>
                        <span className="text-destructive/70 line-through">{change.removedText.slice(0, 300)}</span>
                      </div>
                    )}
                    {change.addedText && (
                      <div className="px-2 py-1.5 rounded bg-primary/10 border-l-2 border-primary/40">
                        <span className="text-primary font-bold mr-2">+</span>
                        <span className="text-primary/90">{change.addedText.slice(0, 300)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Detailed diff not available for this change.</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                <span>{new Date(change.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </div>
    </Collapsible>
  );
}
