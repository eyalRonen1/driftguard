"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  createdAt: string;
}

export default function MonitorDetailPage() {
  const { monitorId } = useParams<{ monitorId: string }>();
  const router = useRouter();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => { fetchData(); }, [monitorId]);

  async function fetchData() {
    const res = await fetch(`/api/v1/monitors/${monitorId}`);
    if (!res.ok) { router.push("/dashboard/monitors"); return; }
    const data = await res.json();
    setMonitor(data.monitor);
    setChanges(data.changes || []);
    setLoading(false);
  }

  async function handleCheck() {
    setChecking(true);
    const res = await fetch(`/api/v1/monitors/${monitorId}/check`, { method: "POST" });
    if (res.ok) await fetchData();
    setChecking(false);
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
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard/monitors" className="hover:text-blue-600">Monitors</Link>
        <span>/</span>
        <span className="text-gray-900">{monitor.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{monitor.name}</h1>
          <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
            {monitor.url}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {checking ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
            )}
            {checking ? "Checking..." : "Check now"}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Health</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${
              monitor.healthStatus === "error" ? "bg-red-500" :
              monitor.healthStatus === "unstable" ? "bg-yellow-500" :
              monitor.healthStatus === "blocked" ? "bg-orange-500" :
              "bg-green-500"
            }`} />
            <span className="font-semibold capitalize">{monitor.healthStatus}</span>
          </div>
          {monitor.healthReason && (
            <p className="text-xs text-gray-400 mt-1">{monitor.healthReason}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Frequency</p>
          <p className="font-semibold mt-1 capitalize">{monitor.checkFrequency}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Last Checked</p>
          <p className="font-semibold mt-1">
            {monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleString() : "Never"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Changes Detected</p>
          <p className="font-semibold mt-1 text-blue-600">{changes.length}</p>
        </div>
      </div>

      {/* Error banner */}
      {monitor.lastError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800 font-medium">Last error: {monitor.lastError}</p>
          <p className="text-xs text-red-600 mt-1">Consecutive errors: {monitor.consecutiveErrors}</p>
        </div>
      )}

      {/* Changes timeline */}
      <h2 className="text-lg font-semibold mb-4">Change History</h2>
      {changes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No changes detected yet. We&apos;ll alert you when something changes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {changes.map((change) => (
            <div key={change.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{change.summary}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      change.importanceScore >= 7 ? "bg-red-100 text-red-700" :
                      change.importanceScore >= 4 ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {change.importanceScore}/10
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {change.changeType}
                    </span>
                    {change.diffPercentage && (
                      <span className="text-xs text-gray-400">{parseFloat(change.diffPercentage).toFixed(1)}% changed</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(change.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
