"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChangeTimeline } from "@/components/dashboard/change-timeline";
import { LiveCheckButton } from "@/components/dashboard/live-check";
import { HealthSparkline, UptimeBar } from "@/components/dashboard/health-sparkline";
import { useChatContext } from "@/components/chat/chat-context";
import { AlertPreferences } from "@/components/dashboard/alert-preferences";
import { FirstMonitorCard } from "@/components/dashboard/first-monitor-card";
import { MonitorSettings } from "@/components/dashboard/monitor-settings";

interface Monitor {
  id: string;
  name: string;
  url: string;
  checkFrequency: string;
  isActive: boolean;
  isPaused: boolean;
  lastCheckedAt: string | null;
  consecutiveErrors: number;
  lastError: string | null;
  healthStatus: string;
  healthReason: string | null;
  useCase: string | null;
  preferredCheckHour: number | null;
  preferredCheckDay: number | null;
  cssSelector: string | null;
  ignoreSelectors: string | null;
  watchKeywords: string | null;
  description: string | null;
  tags: string | null;
}

interface Change {
  id: string;
  summary: string;
  changeType: string;
  importanceScore: number;
  diffPercentage: string | null;
  addedText: string | null;
  removedText: string | null;
  details: string | null;
  actionItem: string | null;
  focusedDiffBefore: string | null;
  focusedDiffAfter: string | null;
  tags: string | null;
  createdAt: string;
}

export default function MonitorDetailPage() {
  const { monitorId } = useParams<{ monitorId: string }>();
  const router = useRouter();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [emailUnsubscribedAt, setEmailUnsubscribedAt] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("UTC");
  const [showSchedule, setShowSchedule] = useState(false);
  const [preferredHour, setPreferredHour] = useState<string>("");
  const [preferredDay, setPreferredDay] = useState<string>("");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const { setPageContext } = useChatContext();

  useEffect(() => { fetchData(); }, [monitorId]);

  async function fetchData() {
    const res = await fetch(`/api/v1/monitors/${monitorId}`);
    if (!res.ok) { router.push("/dashboard/monitors"); return; }
    const data = await res.json();
    setMonitor(data.monitor);
    setChanges(data.changes || []);
    if (data.plan) setPlan(data.plan);
    if (data.userEmail) setUserEmail(data.userEmail);
    if (data.emailUnsubscribedAt) setEmailUnsubscribedAt(data.emailUnsubscribedAt);
    if (data.timezone) setTimezone(data.timezone);
    setPreferredHour(data.monitor?.preferredCheckHour != null ? String(data.monitor.preferredCheckHour) : "");
    setPreferredDay(data.monitor?.preferredCheckDay != null ? String(data.monitor.preferredCheckDay) : "");

    // Set chat context so Camo knows about this specific page
    setPageContext({
      monitorName: data.monitor?.name,
      monitorUrl: data.monitor?.url,
      recentChanges: (data.changes || []).slice(0, 5).map((c: Change) => c.summary),
    });
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this monitor and all its history?")) return;
    await fetch(`/api/v1/monitors/${monitorId}`, { method: "DELETE" });
    router.push("/dashboard/monitors");
  }

  async function handleSaveSchedule() {
    setScheduleSaving(true);
    setScheduleSaved(false);
    try {
      const res = await fetch(`/api/v1/monitors/${monitorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCheckHour: preferredHour !== "" ? Number(preferredHour) : null,
          preferredCheckDay: preferredDay !== "" ? Number(preferredDay) : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMonitor(data.monitor);
        setScheduleSaved(true);
        setTimeout(() => setScheduleSaved(false), 2000);
      }
    } catch {
      // silently fail
    } finally {
      setScheduleSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-jade)]" />
      </div>
    );
  }

  if (!monitor) return null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4">
        <Link href="/dashboard/monitors" className="hover:text-[var(--accent-jade)]">Monitors</Link>
        <span>/</span>
        <span className="text-[var(--text-cream)]">{monitor.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-cream)]">{monitor.name}</h1>
          <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-base text-[var(--accent-jade)] hover:underline">
            {monitor.url}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <LiveCheckButton monitorId={monitorId} onComplete={fetchData} />
          <a
            href={`/api/v1/monitors/${monitorId}/export`}
            download
            className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-cream)] border border-white/10 rounded-lg hover:bg-white/5 transition inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </a>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Uptime bar + Sparkline */}
      <div className="card-glass p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">Response time (24h)</span>
          <HealthSparkline data={[]} width={140} height={28} />
        </div>
        <UptimeBar checks={30} healthyCount={Math.max(30 - (monitor.consecutiveErrors || 0), 25)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="card-glass p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-scales.webp" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Page health</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-3 w-3">
                {monitor.healthStatus === "healthy" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-jade)] opacity-75" />}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  monitor.healthStatus === "error" ? "bg-[var(--accent-ruby)]" :
                  monitor.healthStatus === "unstable" ? "bg-[var(--accent-gold)]" :
                  "bg-[var(--accent-jade)]"
                }`} />
              </span>
              <span className="text-base font-bold capitalize">{monitor.healthStatus}</span>
            </div>
          </div>
        </div>
        <div className="card-glass p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-rings.webp" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Check schedule</p>
            <p className="text-base font-bold mt-2 capitalize">{monitor.checkFrequency}</p>
          </div>
        </div>
        <div className="card-glass p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-eye.webp" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Last checked</p>
            <p className="font-bold text-sm mt-2">{monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleString() : "Never"}</p>
          </div>
        </div>
        <div className="card-glass p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-spiral.webp" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Updates found</p>
            <p className="font-bold text-xl mt-2 text-[var(--accent-gold)]">{changes.length}</p>
          </div>
        </div>
      </div>

      {/* Monitor settings - view & edit */}
      <MonitorSettings monitor={monitor} monitorId={monitorId} onSaved={fetchData} />

      {/* Schedule options (for daily, weekly, every_6h) */}
      {["daily", "weekly", "every_6h"].includes(monitor.checkFrequency) && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full text-left text-sm text-[var(--text-sage)] hover:text-[var(--accent-jade)] transition flex items-center gap-2 py-3 px-4 rounded-xl border border-white/8 hover:border-white/15 bg-white/[0.02]"
          >
            <svg className={`w-4 h-4 transition-transform ${showSchedule ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-base">&#9200;</span>
            <span>Schedule  - choose when to check</span>
            {(monitor.preferredCheckHour != null || monitor.preferredCheckDay != null) && (
              <span className="ml-auto text-xs text-[var(--text-muted)]">
                {monitor.checkFrequency === "weekly" && monitor.preferredCheckDay != null
                  ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][monitor.preferredCheckDay] + " "
                  : ""}
                {monitor.preferredCheckHour != null
                  ? (() => { const d = new Date(); d.setUTCHours(monitor.preferredCheckHour, 0, 0, 0); return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone }); })()
                  : ""}
              </span>
            )}
          </button>
          {showSchedule && (
            <div className="mt-2 p-4 rounded-xl border border-white/8 bg-white/[0.02] space-y-3">
              {monitor.checkFrequency === "weekly" && (
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Preferred day</label>
                  <select
                    value={preferredDay}
                    onChange={(e) => setPreferredDay(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)]"
                  >
                    <option value="">Any day</option>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  {monitor.checkFrequency === "every_6h" ? "First check at" : "Preferred time"}
                </label>
                <select
                  value={preferredHour}
                  onChange={(e) => setPreferredHour(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)]"
                >
                  <option value="">Anytime</option>
                  {Array.from({ length: 24 }, (_, utcHour) => {
                    const d = new Date();
                    d.setUTCHours(utcHour, 0, 0, 0);
                    const localLabel = d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone });
                    return (
                      <option key={utcHour} value={String(utcHour)}>
                        {localLabel}
                      </option>
                    );
                  })}
                </select>
                {monitor.checkFrequency === "every_6h" && preferredHour && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Checks at {[0, 6, 12, 18].map((offset) => {
                      const utcH = (Number(preferredHour) + offset) % 24;
                      const d = new Date();
                      d.setUTCHours(utcH, 0, 0, 0);
                      return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone });
                    }).join(", ")}
                  </p>
                )}
              </div>
              {/* Save button: show when values differ from stored */}
              {(
                (preferredHour !== (monitor.preferredCheckHour != null ? String(monitor.preferredCheckHour) : "")) ||
                (preferredDay !== (monitor.preferredCheckDay != null ? String(monitor.preferredCheckDay) : ""))
              ) && (
                <button
                  onClick={handleSaveSchedule}
                  disabled={scheduleSaving}
                  className="w-full py-2 text-sm font-medium rounded-lg bg-[var(--accent-jade)] text-[var(--bg-deep)] hover:opacity-90 transition disabled:opacity-50"
                >
                  {scheduleSaving ? "Saving..." : "Save schedule"}
                </button>
              )}
              {scheduleSaved && (
                <p className="text-xs text-[var(--accent-jade)] text-center flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Schedule updated
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error banner */}
      {monitor.lastError && (
        <div className="card-glass !border-[var(--accent-ruby)]/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-ruby)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[var(--accent-ruby)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--accent-ruby)]">
                {monitor.healthReason || monitor.lastError}
              </p>
              {monitor.consecutiveErrors > 1 && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Failed {monitor.consecutiveErrors} times in a row. Camo will keep trying.
                </p>
              )}
              {(monitor.lastError?.includes("bot protection") || monitor.lastError?.includes("403") || monitor.lastError?.includes("Forbidden")) && (
                <div className="mt-2 p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-[10px] text-[var(--text-sage)]">
                    <strong>Tip:</strong> This site blocks automated access. Try these alternatives:
                  </p>
                  <ul className="text-[10px] text-[var(--text-muted)] mt-1 space-y-0.5 ml-4 list-disc">
                    <li>Check if the site has an RSS feed (add /feed or /rss to the URL)</li>
                    <li>Monitor a different page on the same site</li>
                    <li>Use a specific API endpoint if available</li>
                  </ul>
                </div>
              )}
              {(monitor.lastError?.includes("not found") || monitor.lastError?.includes("404")) && (
                <div className="mt-2 p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-[10px] text-[var(--text-sage)]">
                    <strong>Tip:</strong> The page might have moved. Try checking the site for a new URL, or update this monitor with the correct address.
                  </p>
                </div>
              )}
              {monitor.lastError?.includes("monthly checks") && (
                <div className="mt-2 p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-[10px] text-[var(--text-sage)]">
                    <strong>Tip:</strong> Upgrade your plan to get more monthly checks, or wait until the 1st of next month when your quota resets.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* First monitor activation card (no changes yet) */}
      {changes.length === 0 && (
        <FirstMonitorCard
          monitorName={monitor.name}
          monitorUrl={monitor.url}
          checkFrequency={monitor.checkFrequency}
          lastCheckedAt={monitor.lastCheckedAt}
        />
      )}

      {/* Changes timeline */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Image src="/assets/camo-watch.webp" alt="" width={24} height={24} />
        What changed
      </h2>
      {changes.length > 0 ? (
        <ChangeTimeline changes={changes} />
      ) : (
        <div className="card-glass p-6 text-center">
          <Image src="/assets/camo-rest.webp" alt="" width={64} height={64} className="mx-auto mb-3 opacity-60" />
          <p className="text-sm text-[var(--text-muted)]">No changes detected yet. Camo is watching!</p>
        </div>
      )}

      {/* Alert preferences */}
      <div className="mt-8">
        <AlertPreferences monitorId={monitorId} monitorName={monitor.name} userEmail={userEmail} plan={plan} emailUnsubscribedAt={emailUnsubscribedAt} />
      </div>
    </div>
  );
}
