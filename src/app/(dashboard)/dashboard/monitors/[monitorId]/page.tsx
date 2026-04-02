"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import { ChangeTimeline } from "@/components/dashboard/change-timeline";
import { LiveCheckButton } from "@/components/dashboard/live-check";
import { HealthSparkline, UptimeBar } from "@/components/dashboard/health-sparkline";
import { useChatContext } from "@/components/chat/chat-context";
import { AlertPreferences } from "@/components/dashboard/alert-preferences";
import { FirstMonitorCard } from "@/components/dashboard/first-monitor-card";

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
}

interface Change {
  id: string;
  summary: string;
  changeType: string;
  importanceScore: number;
  diffPercentage: string | null;
  addedText: string | null;
  removedText: string | null;
  createdAt: string;
}

export default function MonitorDetailPage() {
  const { monitorId } = useParams<{ monitorId: string }>();
  const router = useRouter();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const { setPageContext } = useChatContext();

  // Get the authenticated user's email for alert preferences
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  useEffect(() => { fetchData(); }, [monitorId]);

  async function fetchData() {
    const res = await fetch(`/api/v1/monitors/${monitorId}`);
    if (!res.ok) { router.push("/dashboard/monitors"); return; }
    const data = await res.json();
    setMonitor(data.monitor);
    setChanges(data.changes || []);

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
          <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent-jade)] hover:underline">
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
      <div className="card-glass p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium">Response time (24h)</span>
          <HealthSparkline data={[]} width={140} height={28} />
        </div>
        <UptimeBar checks={30} healthyCount={Math.max(30 - (monitor.consecutiveErrors || 0), 25)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="card-glass p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-scales.webp" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Page health</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-3 w-3">
                {monitor.healthStatus === "healthy" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-jade)] opacity-75" />}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  monitor.healthStatus === "error" ? "bg-[var(--accent-ruby)]" :
                  monitor.healthStatus === "unstable" ? "bg-[var(--accent-gold)]" :
                  "bg-[var(--accent-jade)]"
                }`} />
              </span>
              <span className="font-bold capitalize">{monitor.healthStatus}</span>
            </div>
          </div>
        </div>
        <div className="card-glass p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-rings.webp" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Check schedule</p>
            <p className="font-bold mt-2 capitalize">{monitor.checkFrequency}</p>
          </div>
        </div>
        <div className="card-glass p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-eye.webp" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Last checked</p>
            <p className="font-bold text-sm mt-2">{monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleString() : "Never"}</p>
          </div>
        </div>
        <div className="card-glass p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-spiral.webp" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Updates found</p>
            <p className="font-bold text-lg mt-2 text-[var(--accent-gold)]">{changes.length}</p>
          </div>
        </div>
      </div>

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
        <AlertPreferences monitorId={monitorId} monitorName={monitor.name} userEmail={userEmail} />
      </div>
    </div>
  );
}
