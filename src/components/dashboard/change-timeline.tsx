"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { InlineWordDiff } from "@/components/dashboard/inline-word-diff";

interface Change {
  id: string;
  summary: string;
  changeType: string;
  importanceScore: number;
  createdAt: string;
  addedText?: string | null;
  removedText?: string | null;
  details?: string | null;
  actionItem?: string | null;
  focusedDiffBefore?: string | null;
  focusedDiffAfter?: string | null;
  tags?: string | null;
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

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
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

/* ------------------------------------------------------------------ */
/*  Level 3  - Full diff modal                                         */
/* ------------------------------------------------------------------ */

function FullDiffModal({
  change,
  open,
  onOpenChange,
}: {
  change: Change;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const hasBothTexts = change.removedText && change.addedText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Full before/after comparison</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Summary + details at top of modal */}
          <div className="space-y-2">
            <p className="text-sm text-foreground">{change.summary}</p>
            {change.details && (
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                {change.details.split("\n").filter(Boolean).map((line, i) => (
                  <li key={i}>{line.replace(/^[-*•]\s*/, "")}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border/30" />

          {/* Inline word diff for aligned focused diff */}
          {change.focusedDiffBefore && change.focusedDiffAfter ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Inline comparison
              </p>
              <div className="rounded-lg border border-border/50 p-3 bg-muted/5">
                <InlineWordDiff before={change.focusedDiffBefore} after={change.focusedDiffAfter} />
              </div>
            </div>
          ) : null}

          {/* Separate removed/added blocks */}
          {(change.removedText || change.addedText) ? (
            <>
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
            </>
          ) : null}
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Level 1 + 2  - Change card (collapsed / expanded)                  */
/* ------------------------------------------------------------------ */

function ChangeCard({ change, isFirst }: { change: Change; isFirst: boolean }) {
  const [open, setOpen] = useState(false);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  const dotColor = change.importanceScore >= 7
    ? "bg-destructive shadow-[0_0_8px_var(--destructive)]"
    : change.importanceScore >= 4
    ? "bg-chart-2 shadow-[0_0_8px_var(--chart-2)]"
    : "bg-primary shadow-[0_0_8px_var(--primary)]";

  const changeTypeClass = CHANGE_TYPE_COLORS[change.changeType] || CHANGE_TYPE_COLORS.content;
  const importanceBadgeClass = getImportanceBadgeClass(change.importanceScore);
  const tagList = parseTags(change.tags);
  const hasDiff = change.addedText || change.removedText || change.focusedDiffBefore;

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
              <CardContent className="p-5 cursor-pointer text-left w-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* ---- Level 1: Collapsed ---- */}

                    {/* Timestamp */}
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      {formatDateTime(change.createdAt)}
                      <span className="ml-2 opacity-60">({timeAgo(change.createdAt)})</span>
                    </p>

                    {/* Full summary  - no clamp */}
                    <p className="text-base font-medium">{change.summary}</p>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {/* Importance badge */}
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${importanceBadgeClass}`}>
                        {change.importanceScore}/10 {getImportanceLabel(change.importanceScore)}
                      </span>
                      {/* Change type */}
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded border font-medium capitalize ${changeTypeClass}`}>
                        {change.changeType}
                      </span>
                      {/* Tag pills */}
                      {tagList.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center text-xs px-2 py-0.5 rounded border border-border/50 text-muted-foreground bg-muted/30"
                        >
                          {tag}
                        </span>
                      ))}
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

            {/* ---- Level 2: Expanded ---- */}
            <CollapsibleContent>
              <div className="px-5 pb-5 space-y-3 border-t border-border/30 mt-0 pt-3">

                {/* Full summary (repeated for context when scrolling) */}
                <p className="text-base text-foreground/90">{change.summary}</p>

                {/* Details bullet points */}
                {change.details && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Details</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      {change.details.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i}>{line.replace(/^[-*•]\s*/, "")}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action item callout */}
                {change.actionItem && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      Action item
                    </p>
                    <p className="text-sm text-amber-300/90">{change.actionItem}</p>
                  </div>
                )}

                {/* Changes section with InlineWordDiff */}
                {hasDiff && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Changes</p>
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <div className="p-3">
                        {/* Use InlineWordDiff ONLY for aligned focused diff pairs */}
                        {change.focusedDiffBefore && change.focusedDiffAfter ? (
                          <InlineWordDiff before={change.focusedDiffBefore} after={change.focusedDiffAfter} />
                        ) : (
                          /* Separate blocks for unaligned added/removed text */
                          <div className="space-y-1.5 font-mono text-xs">
                            {change.removedText && (
                              <div className="px-2 py-1.5 rounded bg-destructive/10 border-l-2 border-destructive/40">
                                <span className="text-destructive font-bold mr-2">−</span>
                                <span className="text-destructive/70 line-through">{change.removedText.slice(0, 400)}</span>
                              </div>
                            )}
                            {change.addedText && (
                              <div className="px-2 py-1.5 rounded bg-primary/10 border-l-2 border-primary/40">
                                <span className="text-primary font-bold mr-2">+</span>
                                <span className="text-primary/90">{change.addedText.slice(0, 400)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* View full comparison button */}
                      <div className="px-3 pb-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDiffModalOpen(true); }}
                          className="text-xs text-primary hover:text-primary/80 hover:underline transition flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                          </svg>
                          View full comparison
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!hasDiff && (
                  <p className="text-xs text-muted-foreground italic">Detailed diff not available for this change.</p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDateTime(change.createdAt)}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </div>
      </Collapsible>

      {/* Full diff modal */}
      {hasDiff && (
        <FullDiffModal change={change} open={diffModalOpen} onOpenChange={setDiffModalOpen} />
      )}
    </>
  );
}
