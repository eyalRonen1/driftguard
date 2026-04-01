"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const CHANGE_TYPE_COLORS: Record<string, string> = {
  content: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  price: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  removal: "bg-red-500/15 text-red-400 border-red-500/30",
  addition: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  structure: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function getImportanceLabel(score: number): string {
  if (score >= 8) return "Critical";
  if (score >= 6) return "High";
  if (score >= 4) return "Medium";
  if (score >= 2) return "Low";
  return "Minor";
}

function getImportanceBadgeClass(score: number): string {
  if (score >= 8) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (score >= 6) return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  if (score >= 4) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  if (score >= 2) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  return "bg-gray-500/15 text-gray-400 border-gray-500/30";
}

export function ChangeTimeline({ changes }: { changes: Change[] }) {
  if (changes.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center">
          <Image src="/assets/camo-sleep.webp" alt="" width={72} height={72} className="mx-auto mb-3" />
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

function FullDiffModal({ change, open, onOpenChange }: { change: Change; open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Full before/after comparison</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">{change.summary}</p>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {change.removedText ? (
            <div>
              <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
                Removed
              </p>
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap text-destructive/80 line-through">{change.removedText}</pre>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Removed</p>
              <p className="text-xs text-muted-foreground italic">No removed content.</p>
            </div>
          )}

          {change.addedText ? (
            <div>
              <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Added
              </p>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap text-primary/90">{change.addedText}</pre>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Added</p>
              <p className="text-xs text-muted-foreground italic">No added content.</p>
            </div>
          )}
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

function ChangeCard({ change, isFirst }: { change: Change; isFirst: boolean }) {
  const [open, setOpen] = useState(false);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

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

  const changeTypeClass = CHANGE_TYPE_COLORS[change.changeType] || CHANGE_TYPE_COLORS.content;
  const importanceBadgeClass = getImportanceBadgeClass(change.importanceScore);

  return (
    <>
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
                    {/* Prominent date/time */}
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                      {formatDateTime(change.createdAt)}
                      <span className="ml-2 opacity-60">({timeAgo(change.createdAt)})</span>
                    </p>
                    <p className="text-sm font-medium line-clamp-2">
                      {change.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {/* Importance badge with color coding */}
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${importanceBadgeClass}`}>
                        {change.importanceScore}/10 {getImportanceLabel(change.importanceScore)}
                      </span>
                      {/* Change type tag */}
                      <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize ${changeTypeClass}`}>
                        {change.changeType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isFirst && (
                      <Image src="/assets/camo-watch.webp" alt="" width={24} height={24} className="opacity-60" />
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
                          <span className="text-destructive font-bold mr-2">-</span>
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
                    {/* Full comparison button */}
                    <div className="px-3 pb-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDiffModalOpen(true); }}
                        className="text-[11px] text-primary hover:text-primary/80 hover:underline transition flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                        View full before/after comparison
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Detailed diff not available for this change.</p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{formatDateTime(change.createdAt)}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </div>
      </Collapsible>

      {/* Full diff modal */}
      {(change.addedText || change.removedText) && (
        <FullDiffModal change={change} open={diffModalOpen} onOpenChange={setDiffModalOpen} />
      )}
    </>
  );
}
