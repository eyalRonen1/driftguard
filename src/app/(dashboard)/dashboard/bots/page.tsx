"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Chatbot {
  id: string;
  name: string;
  endpointUrl: string;
  scanFrequency: string;
  isActive: boolean;
  lastHealthScore: string | null;
  lastScanAt: string | null;
}

export default function BotsPage() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchBots();
  }, []);

  async function fetchBots() {
    const res = await fetch("/api/v1/bots");
    const data = await res.json();
    setBots(data.bots || []);
    setLoading(false);
  }

  function getHealthColor(score: string | null) {
    if (!score) return "bg-gray-100 text-gray-600";
    const num = parseFloat(score);
    if (num >= 80) return "bg-green-100 text-green-700";
    if (num >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
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
          <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
          <p className="text-gray-500 mt-1">Monitor your AI chatbots for quality drift</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add chatbot
        </button>
      </div>

      {showAddForm && (
        <AddBotForm
          onClose={() => setShowAddForm(false)}
          onCreated={() => {
            setShowAddForm(false);
            fetchBots();
          }}
        />
      )}

      {bots.length === 0 && !showAddForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No chatbots yet</h2>
          <p className="text-gray-500 mb-6">
            Add your first chatbot to start monitoring.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add your first chatbot
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {bots.map((bot) => (
            <Link
              key={bot.id}
              href={`/dashboard/bots/${bot.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                    {bot.endpointUrl}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(bot.lastHealthScore)}`}>
                    {bot.lastHealthScore ? `${parseFloat(bot.lastHealthScore).toFixed(0)}%` : "No scans"}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${bot.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>Frequency: {bot.scanFrequency}</span>
                {bot.lastScanAt && (
                  <span>Last scan: {new Date(bot.lastScanAt).toLocaleDateString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AddBotForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [requestBody, setRequestBody] = useState('{"message": "{{question}}"}');
  const [responsePath, setResponsePath] = useState("response");
  const [scanFrequency, setScanFrequency] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/v1/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        connectionType: "api_endpoint",
        endpointUrl,
        apiKey: apiKey || undefined,
        requestTemplate: {
          method: "POST",
          body: requestBody,
          contentType: "application/json",
        },
        responsePath,
        scanFrequency,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create chatbot");
      setLoading(false);
      return;
    }

    onCreated();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Add a chatbot</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bot name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Support Bot"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API endpoint URL</label>
          <input
            type="url"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://api.example.com/chat"
          />
          <p className="text-xs text-gray-400 mt-1">The HTTP endpoint your chatbot accepts messages at</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API key <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk-..."
          />
          <p className="text-xs text-gray-400 mt-1">Encrypted and stored securely. Never shared.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Request body template</label>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Use {"{{question}}"} as placeholder for the test question
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Response path</label>
            <input
              type="text"
              value={responsePath}
              onChange={(e) => setResponsePath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="response.text"
            />
            <p className="text-xs text-gray-400 mt-1">JSON path to the answer field</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scan frequency</label>
            <select
              value={scanFrequency}
              onChange={(e) => setScanFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="every_6h">Every 6 hours</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual only</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add chatbot"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
