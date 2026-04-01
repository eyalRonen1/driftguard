"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Live Check Animation - When user clicks "Check now",
 * shows Camo actively scanning with a multi-step animation.
 */

const STEPS = [
  { label: "Connecting to page...", icon: "🔗", delay: 800 },
  { label: "Fetching content...", icon: "📄", delay: 1200 },
  { label: "Comparing with last snapshot...", icon: "🔍", delay: 1000 },
  { label: "AI analyzing changes...", icon: "🧠", delay: 1500 },
];

export function LiveCheckButton({
  monitorId,
  onComplete,
}: {
  monitorId: string;
  onComplete: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState<{
    changed: boolean;
    summary?: string;
  } | null>(null);

  async function handleCheck() {
    setChecking(true);
    setResult(null);

    // Animate through steps
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, STEPS[i].delay));
    }

    // Actually run the check
    try {
      const res = await fetch(`/api/v1/monitors/${monitorId}/check`, { method: "POST" });
      const data = await res.json();

      setResult({
        changed: data.result?.changed || false,
        summary: data.result?.summary || undefined,
      });
    } catch {
      setResult({ changed: false });
    }

    setStep(-1);
    setChecking(false);

    // Refresh parent after a moment
    setTimeout(onComplete, 1500);
  }

  return (
    <div>
      <Button
        onClick={handleCheck}
        disabled={checking}
        className="gap-2"
      >
        {checking ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        )}
        {checking ? "Scanning..." : "Check now"}
      </Button>

      {/* Scanning overlay */}
      {checking && step >= 0 && (
        <Card className="mt-4 p-5 border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src="/assets/camo-watch.png"
                alt=""
                width={48}
                height={48}
                className="animate-pulse"
              />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{STEPS[step].icon}</span>
                <p className="text-sm font-medium">{STEPS[step].label}</p>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Step {step + 1} of {STEPS.length}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Result toast */}
      {result && (
        <Card className={`mt-4 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          result.changed ? "border-chart-2/30" : "border-primary/20"
        }`}>
          <div className="flex items-center gap-3">
            <Image
              src={result.changed ? "/assets/camo-watch.png" : "/assets/camo-happy.png"}
              alt=""
              width={36}
              height={36}
            />
            <div>
              {result.changed ? (
                <>
                  <p className="text-sm font-medium text-chart-2">Change detected!</p>
                  {result.summary && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{result.summary}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-primary">No changes. All good!</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
