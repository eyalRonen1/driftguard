"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

/**
 * Alert Preferences - Per-monitor notification settings.
 * User configures: minimum importance, channels, quiet hours.
 */

const IMPORTANCE_LEVELS = [
  { value: 1, label: "Everything", desc: "All changes, even minor", color: "bg-muted" },
  { value: 3, label: "Notable+", desc: "Skip trivial changes", color: "bg-chart-2/20" },
  { value: 5, label: "Important+", desc: "Only meaningful changes", color: "bg-chart-2/40" },
  { value: 7, label: "Critical only", desc: "Only major changes", color: "bg-destructive/20" },
];

export function AlertPreferences({
  monitorId,
  monitorName,
  currentThreshold = 3,
  emailEnabled = true,
  slackEnabled = false,
}: {
  monitorId: string;
  monitorName: string;
  currentThreshold?: number;
  emailEnabled?: boolean;
  slackEnabled?: boolean;
}) {
  const [threshold, setThreshold] = useState(currentThreshold);
  const [email, setEmail] = useState(emailEnabled);
  const [slack, setSlack] = useState(slackEnabled);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    // TODO: Save to DB via API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Image src="/assets/camo-happy.png" alt="" width={20} height={20} />
          Alert preferences for {monitorName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Importance threshold */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Minimum importance to alert</p>
          <div className="grid grid-cols-2 gap-2">
            {IMPORTANCE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setThreshold(level.value)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  threshold === level.value
                    ? "border-primary bg-primary/10"
                    : "border-border/30 hover:border-border/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${level.color}`} />
                  <span className="text-xs font-medium">{level.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Alert channels</p>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 cursor-pointer hover:border-border/60 transition">
              <div className="flex items-center gap-2">
                <span className="text-sm">📧</span>
                <span className="text-xs">Email</span>
              </div>
              <input
                type="checkbox"
                checked={email}
                onChange={(e) => setEmail(e.target.checked)}
                className="rounded border-border"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 cursor-pointer hover:border-border/60 transition">
              <div className="flex items-center gap-2">
                <span className="text-sm">💬</span>
                <span className="text-xs">Slack</span>
                <Badge variant="outline" className="text-[8px] px-1 py-0">Pro</Badge>
              </div>
              <input
                type="checkbox"
                checked={slack}
                onChange={(e) => setSlack(e.target.checked)}
                className="rounded border-border"
              />
            </label>
          </div>
        </div>

        <Button size="sm" onClick={handleSave} className="w-full">
          {saved ? "✓ Saved!" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
