"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MonitorCard } from "@/components/dashboard/monitor-card";

interface Monitor {
  id: string;
  name: string;
  url: string;
  checkFrequency: string;
  isActive: boolean;
  isPaused: boolean;
  lastCheckedAt: string | null;
  consecutiveErrors: number;
  healthStatus?: string;
}

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Healthy", value: "healthy" },
  { label: "Unstable", value: "unstable" },
  { label: "Error", value: "error" },
  { label: "Paused", value: "paused" },
];

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchMonitors(); }, []);

  async function fetchMonitors() {
    const res = await fetch("/api/v1/monitors");
    const data = await res.json();
    setMonitors(data.monitors || []);
    setLoading(false);
  }

  // Client-side filtering
  const filtered = monitors.filter((m) => {
    // Search
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.url.toLowerCase().includes(q)) return false;
    }
    // Status filter
    if (filter === "healthy") return (m.healthStatus || "healthy") === "healthy" && m.isActive;
    if (filter === "unstable") return m.healthStatus === "unstable";
    if (filter === "error") return m.healthStatus === "error" || m.consecutiveErrors > 0;
    if (filter === "paused") return m.isPaused || !m.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Monitors</h1>
          <p className="text-sm text-muted-foreground">{monitors.length} total</p>
        </div>
        <Button onClick={() => window.location.href = "/dashboard/monitors/new"}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add monitor
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <Input
            placeholder="Search monitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <Badge
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-1 opacity-60">
                  {monitors.filter((m) => {
                    if (f.value === "healthy") return (m.healthStatus || "healthy") === "healthy" && m.isActive;
                    if (f.value === "unstable") return m.healthStatus === "unstable";
                    if (f.value === "error") return m.healthStatus === "error" || m.consecutiveErrors > 0;
                    if (f.value === "paused") return m.isPaused || !m.isActive;
                    return false;
                  }).length}
                </span>
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Monitor list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          {monitors.length === 0 ? (
            <>
              <Image src="/assets/empty-hammock.png" alt="" width={150} height={150} className="mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No monitors yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Give Camo a page to watch.</p>
              <Button onClick={() => window.location.href = "/dashboard/monitors/new"}>
                Add first monitor
              </Button>
            </>
          ) : (
            <>
              <Image src="/assets/camo-happy.png" alt="" width={60} height={60} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No monitors match your search.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <MonitorCard
              key={m.id}
              id={m.id}
              name={m.name}
              url={m.url}
              checkFrequency={m.checkFrequency}
              healthStatus={m.healthStatus || "healthy"}
              isActive={m.isActive && !m.isPaused}
              lastCheckedAt={m.lastCheckedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
