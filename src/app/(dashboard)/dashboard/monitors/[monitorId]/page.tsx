"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChangeTimeline } from "@/components/dashboard/change-timeline";
import { LiveCheckButton } from "@/components/dashboard/live-check";
import { HealthSparkline, UptimeBar } from "@/components/dashboard/health-sparkline";

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

  useEffect(() => { fetchData(); }, [monitorId]);

  async function fetchData() {
    const res = await fetch(`/api/v1/monitors/${monitorId}`);
    if (!res.ok) { router.push("/dashboard/monitors"); return; }
    const data = await res.json();
    setMonitor(data.monitor);
    setChanges(data.changes || []);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-scales.png" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Health</p>
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
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-rings.png" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Frequency</p>
            <p className="font-bold mt-2 capitalize">{monitor.checkFrequency}</p>
          </div>
        </div>
        <div className="card-glass p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-eye.png" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Last Check</p>
            <p className="font-bold text-sm mt-2">{monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleString() : "Never"}</p>
          </div>
        </div>
        <div className="card-glass p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"><Image src="/assets/pat-spiral.png" alt="" fill className="object-cover" /></div>
          <div className="relative z-10">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Changes</p>
            <p className="font-bold text-lg mt-2 text-[var(--accent-gold)]">{changes.length}</p>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {monitor.lastError && (
        <div className="card-glass !border-[var(--accent-ruby)]/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-[var(--accent-ruby)] font-medium">Last error: {monitor.lastError}</p>
          <p className="text-xs text-[var(--accent-ruby)] mt-1">Consecutive errors: {monitor.consecutiveErrors}</p>
        </div>
      )}

      {/* Changes timeline */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Image src="/assets/camo-watch.png" alt="" width={24} height={24} />
        Change History
      </h2>
      <ChangeTimeline changes={changes} />
    </div>
  );
}
