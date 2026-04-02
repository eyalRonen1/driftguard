"use client";

import { useState } from "react";
import Link from "next/link";

type DemoState = "idle" | "loading" | "success" | "error" | "protected" | "limit";

const MAX_TRIES = 2;

export function UrlDemo() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<DemoState>("idle");
  const [tries, setTries] = useState(0);
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

    if (tries >= MAX_TRIES) {
      setState("limit");
      return;
    }

    let checkUrl = trimmed;
    if (!/^https?:\/\//i.test(checkUrl)) {
      checkUrl = `https://${checkUrl}`;
    }

    // Clean tracking parameters — they change on every click and cause noise
    try {
      const parsed = new URL(checkUrl);
      const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_campaignid", "gclid", "gad_source", "gad_campaignid", "dclid", "fbclid", "msclkid", "ref", "mc_cid", "mc_eid"];
      trackingParams.forEach((p) => parsed.searchParams.delete(p));
      checkUrl = parsed.toString();
    } catch {}
    setUrl(checkUrl);

    setState("loading");
    setError("");
    setResult(null);
    setTries((t) => t + 1);

    try {
      const res = await fetch("/api/preview-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: checkUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || "";
        if (errMsg.includes("403") || errMsg.includes("Forbidden") || errMsg.includes("Blocked") || errMsg.includes("503") || errMsg.includes("491") || errMsg.includes("429")) {
          setState("protected");
          return;
        }
        setError(errMsg || "Could not reach this URL");
        setState("error");
        return;
      }

      // Very little content = likely a JS-only SPA that proxy couldn't fully render
      if (data.wordCount < 5) {
        setState("protected");
        return;
      }

      setResult(data);
      setState("success");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  const canTry = tries < MAX_TRIES;

  return (
    <div className="max-w-xl mx-auto">
      {/* Input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canTry && handleCheck()}
          placeholder="Paste any URL to try..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-base text-[var(--text-cream)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)] focus:border-transparent"
          disabled={state === "loading" || !canTry}
        />
        <button
          onClick={handleCheck}
          disabled={!url.trim() || state === "loading" || !canTry}
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
            `Try it free${tries > 0 ? ` (${MAX_TRIES - tries} left)` : ""}`
          )}
        </button>
      </div>

      {/* Rate limit reached */}
      {state === "limit" && (
        <div className="mt-4 card-glass rounded-xl p-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-sm font-medium text-[var(--text-cream)] mb-2">Want to check more pages?</p>
          <p className="text-xs text-[var(--text-muted)] mb-4">Sign up for free and monitor unlimited pages with Camo.</p>
          <Link href="/signup" className="btn-primary inline-block text-sm">Sign up free</Link>
        </div>
      )}

      {/* Protected site */}
      {state === "protected" && (
        <div className="mt-4 card-glass rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--accent-gold)]">This site has extra protection</p>
                <p className="text-xs text-[var(--text-muted)]">Preview unavailable, but Camo can still try to monitor it</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-sage)] mb-4">
              Some sites block preview requests but can still be monitored over time. Sign up to add this page — Camo will use multiple strategies to access it.
            </p>
            <Link href="/signup" className="btn-primary block text-center text-sm">
              Try monitoring this page — free
            </Link>
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-jade)]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--accent-jade)]">This page can be monitored!</p>
                <p className="text-xs text-[var(--text-muted)]">{result.wordCount.toLocaleString()} words detected</p>
              </div>
            </div>

            <div className="bg-white/3 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-[var(--text-cream)] mb-1 truncate">{result.title || "Untitled page"}</p>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">{result.preview}</p>
            </div>

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

            <Link href="/signup" className="btn-primary block text-center text-sm">
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
