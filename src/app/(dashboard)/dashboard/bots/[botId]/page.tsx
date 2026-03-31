"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Chatbot {
  id: string;
  name: string;
  endpointUrl: string;
  connectionType: string;
  scanFrequency: string;
  isActive: boolean;
  lastHealthScore: string | null;
  lastScanAt: string | null;
}

interface TestCase {
  id: string;
  question: string;
  expectedAnswer: string;
  category: string | null;
  priority: string;
  matchStrategy: string;
  lastScore: string | null;
  lastTestedAt: string | null;
}

export default function BotDetailPage() {
  const { botId } = useParams<{ botId: string }>();
  const router = useRouter();
  const [bot, setBot] = useState<Chatbot | null>(null);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTest, setShowAddTest] = useState(false);

  useEffect(() => {
    Promise.all([fetchBot(), fetchTests()]).then(() => setLoading(false));
  }, [botId]);

  async function fetchBot() {
    const res = await fetch(`/api/v1/bots/${botId}`);
    if (!res.ok) { router.push("/dashboard/bots"); return; }
    const data = await res.json();
    setBot(data.bot);
  }

  async function fetchTests() {
    const res = await fetch(`/api/v1/bots/${botId}/tests`);
    const data = await res.json();
    setTests(data.tests || []);
  }

  async function handleRunScan() {
    const res = await fetch(`/api/v1/bots/${botId}/scans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatbotId: botId, triggerType: "manual" }),
    });
    if (res.ok) {
      await fetchBot();
      await fetchTests();
    }
  }

  function getScoreColor(score: string | null) {
    if (!score) return "text-gray-400";
    const num = parseFloat(score);
    if (num >= 80) return "text-green-600";
    if (num >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!bot) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard/bots" className="hover:text-blue-600">Chatbots</Link>
        <span>/</span>
        <span className="text-gray-900">{bot.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bot.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{bot.endpointUrl}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunScan}
            disabled={tests.length === 0}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Run scan now
          </button>
        </div>
      </div>

      {/* Health Score Card */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Health Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(bot.lastHealthScore)}`}>
            {bot.lastHealthScore ? `${parseFloat(bot.lastHealthScore).toFixed(0)}%` : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Test Cases</p>
          <p className="text-3xl font-bold text-gray-900">{tests.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Frequency</p>
          <p className="text-3xl font-bold text-gray-900 capitalize">{bot.scanFrequency}</p>
        </div>
      </div>

      {/* Test Cases */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Test Cases</h2>
        <button
          onClick={() => setShowAddTest(true)}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          + Add test
        </button>
      </div>

      {showAddTest && (
        <AddTestForm
          botId={botId}
          onClose={() => setShowAddTest(false)}
          onCreated={() => { setShowAddTest(false); fetchTests(); }}
        />
      )}

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-4">No test cases yet. Add questions to monitor your bot.</p>
          <button
            onClick={() => setShowAddTest(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add your first test
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Question</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Priority</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Strategy</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Last Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-md">{test.question}</p>
                    <p className="text-xs text-gray-400 truncate max-w-md mt-0.5">{test.expectedAnswer}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      test.priority === "critical" ? "bg-red-100 text-red-700" :
                      test.priority === "high" ? "bg-orange-100 text-orange-700" :
                      test.priority === "medium" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {test.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{test.matchStrategy}</td>
                  <td className={`px-5 py-3 text-sm font-medium ${getScoreColor(test.lastScore)}`}>
                    {test.lastScore ? `${parseFloat(test.lastScore).toFixed(0)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddTestForm({ botId, onClose, onCreated }: { botId: string; onClose: () => void; onCreated: () => void }) {
  const [question, setQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [priority, setPriority] = useState("medium");
  const [matchStrategy, setMatchStrategy] = useState("semantic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/v1/bots/${botId}/tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, expectedAnswer, priority, matchStrategy }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create test");
      setLoading(false);
      return;
    }

    onCreated();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <h3 className="font-semibold mb-4">Add a test case</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What are your pricing plans?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected answer</label>
          <textarea
            value={expectedAnswer}
            onChange={(e) => setExpectedAnswer(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="We offer three plans: Free, Pro ($29/mo), and Business ($79/mo)..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Match strategy</label>
            <select value={matchStrategy} onChange={(e) => setMatchStrategy(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="semantic">Semantic (LLM judge)</option>
              <option value="contains">Contains keyword</option>
              <option value="exact">Exact match</option>
              <option value="not_contains">Must NOT contain</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Adding..." : "Add test"}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
