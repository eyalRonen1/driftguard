"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

/**
 * First Monitor Card - Shows when a monitor is newly created with no changes yet.
 * Gives user confidence that the system is working.
 */
export function FirstMonitorCard({
  monitorName,
  monitorUrl,
  checkFrequency,
  lastCheckedAt,
}: {
  monitorName: string;
  monitorUrl: string;
  checkFrequency: string;
  lastCheckedAt: string | null;
}) {
  const frequencyText: Record<string, string> = {
    "15min": "every 15 minutes",
    hourly: "every hour",
    every_6h: "every 6 hours",
    daily: "once a day",
    weekly: "once a week",
  };

  return (
    <Card className="border-primary/20 bg-primary/5 mb-6">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Image src="/assets/camo-happy.png" alt="" width={48} height={48} className="flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Camo is now watching this page!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                We saved a snapshot of <span className="text-primary font-medium">{monitorName}</span> and will check it {frequencyText[checkFrequency] || checkFrequency}.
              </p>
            </div>

            {/* What happens next */}
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">What happens next</p>
              <div className="grid gap-1.5">
                {[
                  { done: true, text: "Page saved as baseline" },
                  { done: true, text: `Checking ${frequencyText[checkFrequency] || checkFrequency}` },
                  { done: false, text: "When something changes, you'll see it here" },
                  { done: false, text: "Get an email alert with AI summary" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {step.done ? (
                      <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="bg-muted/30 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground">
                💡 <strong>Tip:</strong> Click &quot;Check now&quot; to trigger a check immediately and see if anything changed since setup.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
