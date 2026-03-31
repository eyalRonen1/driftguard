"use client";

/**
 * Visual Diff Viewer - Shows changes between two text versions
 * with red/green highlighting. The founder wants to SEE changes.
 */

interface DiffLine {
  type: "added" | "removed" | "context";
  text: string;
}

function computeDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.split(/[.!?]\s+/).filter(Boolean);
  const afterLines = after.split(/[.!?]\s+/).filter(Boolean);
  const lines: DiffLine[] = [];

  const beforeSet = new Set(beforeLines.map((l) => l.trim().toLowerCase()));
  const afterSet = new Set(afterLines.map((l) => l.trim().toLowerCase()));

  // Show removed sentences
  for (const line of beforeLines) {
    if (!afterSet.has(line.trim().toLowerCase())) {
      lines.push({ type: "removed", text: line.trim() });
    }
  }

  // Show added sentences
  for (const line of afterLines) {
    if (!beforeSet.has(line.trim().toLowerCase())) {
      lines.push({ type: "added", text: line.trim() });
    }
  }

  // If no sentence-level diff found, show word-level hint
  if (lines.length === 0 && before !== after) {
    lines.push({ type: "removed", text: before.slice(0, 200) });
    lines.push({ type: "added", text: after.slice(0, 200) });
  }

  return lines;
}

export function VisualDiff({
  before,
  after,
  summary,
  importanceScore,
  changeType,
  timestamp,
}: {
  before: string;
  after: string;
  summary: string;
  importanceScore: number;
  changeType: string;
  timestamp: string;
}) {
  const diffLines = computeDiff(before, after);

  return (
    <div className="card-glass p-5 space-y-4">
      {/* AI Summary */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-jade)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[var(--text-cream)] font-medium text-sm">{summary}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              importanceScore >= 7 ? "bg-[var(--accent-ruby)]/15 text-[var(--accent-ruby)]" :
              importanceScore >= 4 ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]" :
              "bg-white/5 text-[var(--text-muted)]"
            }`}>{importanceScore}/10</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-jade)]/10 text-[var(--accent-jade)]">{changeType}</span>
            <span className="text-[10px] text-[var(--text-muted)]">{new Date(timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Visual Diff */}
      {diffLines.length > 0 && (
        <div className="rounded-lg overflow-hidden border border-white/6">
          <div className="px-3 py-1.5 bg-white/3 border-b border-white/6">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">What changed</span>
          </div>
          <div className="p-3 space-y-1 font-mono text-xs">
            {diffLines.map((line, i) => (
              <div
                key={i}
                className={`px-2 py-1 rounded ${
                  line.type === "removed"
                    ? "bg-[var(--accent-ruby)]/10 border-l-2 border-[var(--accent-ruby)]/40"
                    : line.type === "added"
                    ? "bg-[var(--accent-jade)]/10 border-l-2 border-[var(--accent-jade)]/40"
                    : ""
                }`}
              >
                <span className={`mr-2 font-bold ${
                  line.type === "removed" ? "text-[var(--accent-ruby)]" :
                  line.type === "added" ? "text-[var(--accent-jade)]" : "text-[var(--text-muted)]"
                }`}>
                  {line.type === "removed" ? "−" : line.type === "added" ? "+" : " "}
                </span>
                <span className={
                  line.type === "removed" ? "text-[var(--accent-ruby)]/80 line-through" :
                  line.type === "added" ? "text-[var(--accent-jade)]" : "text-[var(--text-muted)]"
                }>
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
