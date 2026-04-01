"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type DemoState = "idle" | "loading" | "success" | "error";

export function UrlDemo() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<DemoState>("idle");
  const [result, setResult] = useState<{
    title: string;
    wordCount: number;
    preview: string;
    monitorable: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  async function handleCheck() {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Auto-add https if missing
    let checkUrl = trimmed;
    if (!/^https?:\/\//i.test(checkUrl)) {
      checkUrl = `https://${checkUrl}`;
      setUrl(checkUrl);
    }

    setState("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/preview-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: checkUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not reach this URL");
        setState("error");
        return;
      }

      setResult(data);
      setState("success");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          placeholder="Paste any URL to try..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-base text-[var(--text-cream)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)] focus:border-transparent"
          disabled={state === "loading"}
        />
        <button
          onClick={handleCheck}
          disabled={!url.trim() || state === "loading"}
          className="btn-primary !py-3 !px-6 whitespace-nowrap disabled:opacity-50"
        >
          {state === "loading" ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
              </svg>
              Scanning...
            </span>
          ) : (
            "Try it free"
          )}
        </button>
      </div>

      {/* Error */}
      {state === "error" && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Make sure the URL is correct and publicly accessible.</p>
        </div>
      )}

      {/* Success */}
      {state === "success" && result && (
        <div className="mt-4 card-glass rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-5">
            {/* Status */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result.monitorable ? "bg-[var(--accent-jade)]/20" : "bg-[var(--accent-gold)]/20"}`}>
                {result.monitorable ? (
                  <svg className="w-5 h-5 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`font-semibold text-sm ${result.monitorable ? "text-[var(--accent-jade)]" : "text-[var(--accent-gold)]"}`}>
                  {result.monitorable ? "This page can be monitored!" : "Limited monitoring available"}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{result.wordCount.toLocaleString()} words detected</p>
              </div>
            </div>

            {/* Page info */}
            <div className="bg-white/3 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-[var(--text-cream)] mb-1 truncate">{result.title || "Untitled page"}</p>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">{result.preview}</p>
            </div>

            {/* What Camo would do */}
            <div className="space-y-2 mb-4">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">What Camo will do</p>
              <div className="grid gap-1.5">
                {[
                  { icon: "📸", text: "Save a snapshot of this page" },
                  { icon: "🔍", text: "Check for changes on your schedule" },
                  { icon: "🧠", text: "Summarize changes with AI" },
                  { icon: "🔔", text: "Alert you via email or Slack" },
                ].map((step) => (
                  <div key={step.text} className="flex items-center gap-2">
                    <span className="text-xs">{step.icon}</span>
                    <span className="text-xs text-[var(--text-sage)]">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/signup`}
              className="btn-primary block text-center text-sm"
            >
              Start monitoring this page — free
            </Link>
          </div>
        </div>
      )}

      {/* Hint */}
      {state === "idle" && (
        <p className="text-center text-xs text-[var(--text-muted)]/60 mt-3">
          Try: competitor.com/pricing, news-site.com, any public page
        </p>
      )}
    </div>
  );
}
