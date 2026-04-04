"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScanLiveLog } from "./scan-live-log";

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
    error?: string;
  } | null>(null);
  const [logEntries, setLogEntries] = useState<Array<{ time: string; message: string; type: "info" | "success" | "warning" | "error" }>>([]);

  async function handleCheck() {
    setChecking(true);
    setResult(null);
    setLogEntries([]);

    const addLog = (msg: string, type: "info" | "success" | "warning" | "error" = "info") => {
      const time = new Date().toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLogEntries((prev) => [...prev, { time, message: msg, type }]);
    };

    // Animate through steps with log entries
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      addLog(STEPS[i].label);
      await new Promise((r) => setTimeout(r, STEPS[i].delay));
    }

    // Actually run the check
    try {
      const res = await fetch(`/api/v1/monitors/${monitorId}/check`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        const apiError = data.error || "Something went wrong. Camo will try again at the next scheduled check.";
        addLog(apiError, "error");
        setResult({ changed: false, error: apiError });
      } else if (data.result?.error) {
        addLog(data.result.error, "error");
        setResult({ changed: false, error: data.result.error });
      } else {
        const changed = data.result?.changed || false;
        addLog(changed ? "Change detected!" : "No changes found.", changed ? "warning" : "success");
        addLog("Scan complete.", "success");
        setResult({
          changed,
          summary: data.result?.summary || undefined,
        });
      }
    } catch {
      addLog("Could not reach the server. Check your internet connection and try again.", "error");
      setResult({ changed: false, error: "Could not reach the server. Check your internet connection and try again." });
    }

    setStep(-1);
    setChecking(false);

    // Refresh parent after a moment
    setTimeout(onComplete, 1500);

    // Auto-dismiss overlay after 4 seconds
    setTimeout(() => {
      setLogEntries([]);
      setResult(null);
    }, 4000);
  }

  return (
    <div className="relative">
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

      {/* Floating overlay  - doesn't push content down */}
      {(logEntries.length > 0 || result) && (
        <div className="fixed inset-x-3 top-20 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[320px] z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Live log */}
          {logEntries.length > 0 && (
            <ScanLiveLog entries={logEntries} />
          )}

          {/* Result toast */}
          {result && !checking && (
            <Card className={`mt-2 p-3 ${
              result.error ? "border-destructive/30" : result.changed ? "border-chart-2/30" : "border-primary/20"
            }`}>
              <div className="flex items-center gap-3">
                <Image
                  src={result.error ? "/assets/camo-watch.webp" : result.changed ? "/assets/camo-watch.webp" : "/assets/camo-happy.webp"}
                  alt=""
                  width={28}
                  height={28}
                />
                <div>
                  {result.error ? (
                    <p className="text-xs font-medium text-destructive">{result.error}</p>
                  ) : result.changed ? (
                    <>
                      <p className="text-xs font-medium text-chart-2">Change detected!</p>
                      {result.summary && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{result.summary}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs font-medium text-primary">No changes. All good!</p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
