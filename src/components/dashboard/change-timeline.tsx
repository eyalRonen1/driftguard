"use client";

import Image from "next/image";

/**
 * Change Timeline - Visual timeline of detected changes.
 * Vertical line with color-coded dots and expandable diffs.
 */

interface Change {
  id: string;
  summary: string;
  changeType: string;
  importanceScore: number;
  createdAt: string;
  addedText?: string | null;
  removedText?: string | null;
}

export function ChangeTimeline({ changes }: { changes: Change[] }) {
  if (changes.length === 0) {
    return (
      <div className="card-glass p-8 text-center">
        <Image src="/assets/camo-sleep.png" alt="" width={64} height={64} className="mx-auto mb-3" />
        <p className="text-[var(--text-muted)] text-sm">No changes detected yet.</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">Camo is watching. You&apos;ll see changes here.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--accent-jade)]/30 via-[var(--accent-gold)]/20 to-transparent" />

      <div className="space-y-4">
        {changes.map((change, i) => {
          const dotColor = change.importanceScore >= 7
            ? "bg-[var(--accent-ruby)]"
            : change.importanceScore >= 4
            ? "bg-[var(--accent-gold)]"
            : "bg-[var(--accent-jade)]";

          const glowColor = change.importanceScore >= 7
            ? "shadow-[0_0_8px_var(--accent-ruby)]"
            : change.importanceScore >= 4
            ? "shadow-[0_0_8px_var(--accent-gold)]"
            : "shadow-[0_0_8px_var(--accent-jade)]";

          return (
            <div key={change.id} className="flex gap-4 relative">
              {/* Timeline dot */}
              <div className="flex-shrink-0 relative z-10 mt-1.5">
                <div className={`w-[10px] h-[10px] rounded-full ${dotColor} ${glowColor} ring-2 ring-[var(--bg-ink-1)]`} />
              </div>

              {/* Change card */}
              <div className="flex-1 card-glass p-4 relative overflow-hidden">
                {/* Subtle importance stripe on left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${dotColor} opacity-50`} />

                <div className="pl-2">
                  {/* Camo reaction */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-[var(--text-cream)] font-medium">{change.summary}</p>
                    </div>
                    {i === 0 && (
                      <Image src="/assets/camo-watch.png" alt="" width={28} height={28} className="flex-shrink-0 opacity-60" />
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      change.importanceScore >= 7 ? "bg-[var(--accent-ruby)]/15 text-[var(--accent-ruby)]" :
                      change.importanceScore >= 4 ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]" :
                      "bg-white/5 text-[var(--text-muted)]"
                    }`}>
                      {change.importanceScore}/10
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-jade)]/10 text-[var(--accent-jade)]">
                      {change.changeType}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(change.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
