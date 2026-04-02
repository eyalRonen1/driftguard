"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const USE_CASE_PRESETS = [
  {
    id: "competitor",
    icon: "🎯",
    title: "Track competitor",
    description: "Monitor pricing, features, or messaging changes",
    placeholder: "https://competitor.com/pricing",
    frequency: "daily",
  },
  {
    id: "regulatory",
    icon: "⚖️",
    title: "Monitor regulations",
    description: "Track legal pages, compliance docs, government updates",
    placeholder: "https://regulator.gov/guidelines",
    frequency: "daily",
  },
  {
    id: "ecommerce",
    icon: "🛒",
    title: "Watch supplier prices",
    description: "Track product pages for price and stock changes",
    placeholder: "https://supplier.com/products",
    frequency: "every_6h",
  },
  {
    id: "jobs",
    icon: "💼",
    title: "Track job postings",
    description: "Monitor career pages for new positions",
    placeholder: "https://company.com/careers",
    frequency: "daily",
  },
  {
    id: "content",
    icon: "📝",
    title: "Watch content changes",
    description: "Monitor docs, blogs, or any content page",
    placeholder: "https://docs.example.com/api",
    frequency: "daily",
  },
  {
    id: "custom",
    icon: "🔧",
    title: "Custom monitor",
    description: "Monitor any web page for any reason",
    placeholder: "https://example.com",
    frequency: "daily",
  },
];

export default function NewMonitorPage() {
  const router = useRouter();
  const [step, setStep] = useState<"usecase" | "url" | "creating">("usecase");
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [keywords, setKeywords] = useState("");
  const [keywordMode, setKeywordMode] = useState("any");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const preset = USE_CASE_PRESETS.find((p) => p.id === selectedUseCase);

  function handleSelectUseCase(id: string) {
    setSelectedUseCase(id);
    setStep("url");
    const p = USE_CASE_PRESETS.find((u) => u.id === id);
    if (p) {
      setUrl("");
      setFrequency(p.frequency);
    }
  }

  async function handlePreview() {
    if (!url) return;
    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const res = await fetch("/api/preview-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || "";
        // If it's a bot-protected site, still allow creating the monitor
        if (errMsg.includes("403") || errMsg.includes("Forbidden") || errMsg.includes("503") || errMsg.includes("Blocked") || errMsg.includes("bot protection")) {
          setPreview("This site uses bot protection — Camo will use Smart Browser to watch it.");
          if (!name) setName(new URL(url).hostname);
        } else if (errMsg.includes("ENOTFOUND") || errMsg.includes("resolve") || errMsg.includes("Invalid URL")) {
          setError("Can't find this website. Check that the URL is spelled correctly and the site is online.");
          setLoading(false);
          return;
        } else if (errMsg.includes("ECONNREFUSED") || errMsg.includes("ECONNRESET")) {
          setError("The site refused our connection. It might be temporarily down. Try again in a few minutes.");
          setLoading(false);
          return;
        } else if (errMsg.includes("Timeout") || errMsg.includes("timeout") || errMsg.includes("AbortError")) {
          setError("The page took too long to load. It might be a very slow or heavy page. You can still create the monitor and Camo will keep trying.");
          setLoading(false);
          return;
        } else if (errMsg.includes("404")) {
          setError("This page was not found (404). Check that the URL is correct.");
          setLoading(false);
          return;
        } else if (errMsg.includes("SSL") || errMsg.includes("TLS") || errMsg.includes("certificate")) {
          setError("This site has a security certificate issue. The site owner needs to fix their SSL certificate before it can be monitored.");
          setLoading(false);
          return;
        } else {
          setError(errMsg || "Could not reach this URL. Check that the address is correct and try again.");
          setLoading(false);
          return;
        }
      } else {
        setPreview(data.preview?.slice(0, 300) || "Content detected");
        if (!name) setName(data.title || new URL(url).hostname);
      }
    } catch {
      setError("Could not reach the server. Check your internet connection and try again.");
    }
    setLoading(false);
  }

  async function handleCreate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || new URL(url).hostname,
          url,
          checkFrequency: frequency,
          useCase: selectedUseCase,
          watchKeywords: keywords || undefined,
          keywordMode: keywords ? keywordMode : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong while creating the monitor. Please try again.");
        return;
      }

      router.push(`/dashboard/monitors/${data.monitor.id}`);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-cream)] mb-2">Add a monitor</h1>
      <p className="text-[var(--text-muted)] mb-8">What do you want to keep an eye on?</p>

      {/* Step 1: Choose use case */}
      {step === "usecase" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {USE_CASE_PRESETS.map((uc) => (
            <button
              key={uc.id}
              onClick={() => handleSelectUseCase(uc.id)}
              className="text-left card-glass rounded-xl border border-white/8 p-4 hover:border-[var(--accent-jade)]/30 hover:shadow-md transition group"
            >
              <span className="text-2xl mb-2 block">{uc.icon}</span>
              <h3 className="font-semibold text-[var(--text-cream)] group-hover:text-[var(--accent-jade)]">{uc.title}</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">{uc.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Enter URL */}
      {step === "url" && preset && (
        <div className="space-y-6">
          <button
            onClick={() => { setStep("usecase"); setPreview(null); setError(""); }}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-jade)] flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Change use case
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{preset.icon}</span>
            <div>
              <h2 className="font-semibold text-lg">{preset.title}</h2>
              <p className="text-sm text-[var(--text-muted)]">{preset.description}</p>
            </div>
          </div>

          <div className="card-glass rounded-xl border border-white/8 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-sage)] mb-1">URL to monitor</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setPreview(null); }}
                  required
                  placeholder={preset.placeholder}
                  className="flex-1 px-3 py-2.5 border border-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)]"
                />
                <button
                  onClick={handlePreview}
                  disabled={!url || loading}
                  className="px-4 py-2.5 bg-white/6 text-[var(--text-sage)] rounded-lg hover:bg-white/10 transition disabled:opacity-50 text-sm"
                >
                  {loading ? "Checking..." : "Preview"}
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Supports: websites, JSON APIs, PDF documents, RSS/Atom feeds
              </p>
            </div>

            {/* Preview result */}
            {preview && (
              <div className="card-glass !border-[var(--accent-jade)]/30 rounded-lg p-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-[var(--accent-jade)] font-medium">Page is monitorable!</span>
                </div>
                <p className="text-xs text-[var(--text-sage)] line-clamp-3">{preview}</p>
              </div>
            )}

            {error && (
              <div className="card-glass !border-[var(--accent-ruby)]/30 rounded-lg p-3">
                <p className="text-sm text-[var(--accent-ruby)]">{error}</p>
              </div>
            )}

            {preview && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-sage)] mb-1">Monitor name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)]"
                    placeholder="Competitor pricing page"
                  />
                </div>

                {/* Frequency selector */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-cream)] mb-2">Check frequency</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { value: "daily", label: "Daily", desc: "Once a day" },
                      { value: "weekly", label: "Weekly", desc: "Once a week" },
                      { value: "every_6h", label: "Every 6h", desc: "4× per day", pro: true },
                      { value: "hourly", label: "Hourly", desc: "Every hour", pro: true },
                      { value: "15min", label: "Every 15m", desc: "Real-time", pro: true },
                    ].map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFrequency(f.value)}
                        className={`p-3 rounded-xl border text-left transition ${
                          frequency === f.value
                            ? "border-[var(--accent-jade)] bg-[var(--accent-jade)]/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <p className="text-sm font-medium">{f.label}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{f.desc}</p>
                        {f.pro && <span className="text-[8px] text-[var(--accent-gold)] font-medium">PRO</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyword monitoring (optional) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text-cream)]">
                    Keyword alerts <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="price, sale, discount (comma separated)"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-[var(--text-cream)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)]"
                  />
                  {keywords && (
                    <select
                      value={keywordMode}
                      onChange={(e) => setKeywordMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-[var(--text-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)]"
                    >
                      <option value="any">Alert when any keyword is in changed content</option>
                      <option value="appear">Alert only when keyword appears (new)</option>
                      <option value="disappear">Alert only when keyword disappears</option>
                    </select>
                  )}
                  <p className="text-[10px] text-[var(--text-muted)]">Only get alerts when these keywords appear or disappear on the page</p>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-3 btn-primary transition disabled:opacity-50 font-medium"
                >
                  {loading ? "Creating..." : "Start monitoring"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
