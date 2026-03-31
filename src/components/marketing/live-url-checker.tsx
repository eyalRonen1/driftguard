"use client";

import { useState } from "react";

export function LiveUrlChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    title: string;
    wordCount: number;
    loadTime: number;
    preview: string;
    monitorable: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const start = Date.now();
      const res = await fetch("/api/preview-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const loadTime = Date.now() - start;
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not reach this URL");
        setLoading(false);
        return;
      }

      setResult({
        success: true,
        title: data.title || new URL(url).hostname,
        wordCount: data.wordCount || 0,
        loadTime,
        preview: data.preview || "",
        monitorable: data.monitorable ?? true,
      });
    } catch {
      setError("Could not check this URL. Make sure it starts with https://");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleCheck} className="flex gap-2 mb-6">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://any-website.com/pricing"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-medium text-sm whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Checking...
            </span>
          ) : (
            "Check URL"
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">This page can be monitored!</p>
                <p className="text-xs text-gray-500">{url}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-4 py-3 text-center">
              <p className="text-lg font-bold text-gray-900">{result.loadTime}ms</p>
              <p className="text-xs text-gray-500">Response time</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-lg font-bold text-gray-900">{result.wordCount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Words detected</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-lg font-bold text-green-600">Ready</p>
              <p className="text-xs text-gray-500">Status</p>
            </div>
          </div>

          {/* Content preview */}
          <div className="px-6 py-4">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Content Preview</p>
            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-hidden relative">
              <p className="text-xs text-gray-600 leading-relaxed">{result.preview}</p>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <a
              href="/signup"
              className="block w-full py-2.5 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              Start monitoring this page for free
            </a>
            <p className="text-xs text-gray-400 text-center mt-2">No credit card required</p>
          </div>
        </div>
      )}
    </div>
  );
}
