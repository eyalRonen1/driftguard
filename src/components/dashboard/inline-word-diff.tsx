"use client";
import { useMemo } from "react";
import { diffWords } from "diff";

const MAX_INPUT = 1000;

export function InlineWordDiff({ before, after }: { before: string; after: string }) {
  const changes = useMemo(() => {
    const a = (before || "").slice(0, MAX_INPUT);
    const b = (after || "").slice(0, MAX_INPUT);
    return diffWords(a, b);
  }, [before, after]);

  return (
    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
      {changes.map((part, i) => {
        if (part.removed) {
          return (
            <span key={i} className="bg-red-500/20 text-red-400 line-through decoration-red-400/60 px-0.5 rounded" aria-label="removed">
              {part.value}
            </span>
          );
        }
        if (part.added) {
          return (
            <span key={i} className="bg-emerald-500/20 text-emerald-400 font-medium underline decoration-emerald-400/40 px-0.5 rounded" aria-label="added">
              {part.value}
            </span>
          );
        }
        if (part.value.length > 200) {
          return <span key={i} className="text-muted-foreground">{part.value.slice(0, 80)}…{part.value.slice(-80)}</span>;
        }
        return <span key={i} className="text-muted-foreground">{part.value}</span>;
      })}
    </pre>
  );
}
