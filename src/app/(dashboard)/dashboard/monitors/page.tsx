"use client";

import { useEffect, useState } from "react";
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
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchMonitors(); }, []);

  async function fetchMonitors() {
    const res = await fetch("/api/v1/monitors");
    const data = await res.json();
    setMonitors(data.monitors || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitors</h1>
          <p className="text-gray-500 mt-1">Track changes on any web page</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add monitor
        </button>
      </div>

      {showAdd && (
        <AddMonitorForm
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); fetchMonitors(); }}
        />
      )}

      {monitors.length === 0 && !showAdd ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No monitors yet</h2>
          <p className="text-gray-500 mb-6">Paste a URL to start tracking changes.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add your first monitor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {monitors.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/monitors/${m.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition flex items-center justify-between block"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900">{m.name}</h3>
                <p className="text-sm text-gray-400 truncate">{m.url}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-xs text-gray-400 hidden sm:block">{m.checkFrequency}</span>
                {m.lastCheckedAt && (
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(m.lastCheckedAt).toLocaleDateString()}
                  </span>
                )}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  m.consecutiveErrors > 0 ? "bg-red-500" :
                  m.isActive && !m.isPaused ? "bg-green-500" : "bg-gray-300"
                }`} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AddMonitorForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [cssSelector, setCssSelector] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/v1/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || new URL(url).hostname,
        url,
        checkFrequency: frequency,
        cssSelector: cssSelector || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create monitor");
      setLoading(false);
      return;
    }

    onCreated();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Add a monitor</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL to monitor</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://competitor.com/pricing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Competitor pricing page"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="every_6h">Every 6 hours</option>
              <option value="hourly">Hourly (Pro)</option>
              <option value="15min">Every 15 min (Business)</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSS Selector <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={cssSelector}
              onChange={(e) => setCssSelector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="#pricing, .main-content"
            />
            <p className="text-xs text-gray-400 mt-1">Monitor only a specific section</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Checking URL..." : "Add monitor"}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
