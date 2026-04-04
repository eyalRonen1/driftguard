import { useState, useEffect } from "react";
import { createMonitor } from "@/lib/api";
import { getAuth } from "@/lib/storage";

const FREQUENCIES = [
  { value: "daily", label: "Daily", plans: ["free", "pro", "business"] },
  { value: "weekly", label: "Weekly", plans: ["free", "pro", "business"] },
  { value: "every_6h", label: "Every 6h", plans: ["pro", "business"] },
  { value: "hourly", label: "Hourly", plans: ["pro", "business"] },
  { value: "15min", label: "15 min", plans: ["business"] },
];

function detectUseCase(url: string): string | undefined {
  const path = url.toLowerCase();
  if (path.includes("/pricing") || path.includes("/plans")) return "competitor";
  if (path.includes("/careers") || path.includes("/jobs")) return "jobs";
  if (path.includes("/product") || path.includes("/shop")) return "ecommerce";
  if (path.includes("/docs") || path.includes("/blog")) return "content";
  return undefined;
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*[|\-–—]\s*[^|–—]*$/, "") // strip " | Company Name"
    .replace(/\s*-\s*[^-]*$/, "")
    .trim()
    .slice(0, 100) || "Untitled Page";
}

export function QuickAdd({
  url,
  title,
  onBack,
  onCreated,
}: {
  url: string;
  title: string;
  onBack: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState(cleanTitle(title));
  const [pageUrl, setPageUrl] = useState(url);
  const [frequency, setFrequency] = useState("daily");
  const [cssSelector, setCssSelector] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    getAuth().then((auth) => {
      if (auth) setPlan(auth.org.plan);
    });
    // Auto-detect use case
    const uc = detectUseCase(url);
    if (uc === "competitor") setFrequency("hourly");
    else if (uc === "jobs") setFrequency("daily");
  }, [url]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pageUrl.trim()) return;

    // Validate URL
    let validUrl: string;
    try {
      const urlObj = new URL(pageUrl.trim().startsWith("http") ? pageUrl.trim() : `https://${pageUrl.trim()}`);
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        setError("URL must use http:// or https://");
        return;
      }
      validUrl = urlObj.toString();
    } catch {
      setError("Invalid URL format");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data: any = {
        name: (name.trim() || "Untitled").slice(0, 255),
        url: validUrl,
        checkFrequency: frequency,
      };
      if (cssSelector.trim()) data.cssSelector = cssSelector.trim().slice(0, 500);

      const useCase = detectUseCase(pageUrl);
      if (useCase) data.useCase = useCase;

      await createMonitor(data);
      setSuccess(true);
      setTimeout(onCreated, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create monitor");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
        <p style={{ fontWeight: 600, color: "var(--accent-jade)" }}>Monitor created!</p>
        <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>
          Zikit will start watching this page.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 14px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: "4px 8px" }}>
          ←
        </button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Monitor This Page</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* URL */}
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>URL</label>
        <input
          className="input"
          value={pageUrl}
          onChange={(e) => setPageUrl(e.target.value)}
          placeholder="https://example.com"
          style={{ marginBottom: 10 }}
        />

        {/* Name */}
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Name</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Page name"
          style={{ marginBottom: 10 }}
        />

        {/* Frequency */}
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Check frequency</label>
        <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
          {FREQUENCIES.map((f) => {
            const allowed = f.plans.includes(plan);
            const selected = frequency === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => allowed && setFrequency(f.value)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: selected ? 600 : 400,
                  border: `1px solid ${selected ? "var(--accent-jade)" : "var(--border-subtle)"}`,
                  background: selected ? "rgba(124,203,139,0.15)" : "transparent",
                  color: allowed ? (selected ? "var(--accent-jade)" : "var(--text-cream)") : "var(--text-muted)",
                  cursor: allowed ? "pointer" : "not-allowed",
                  opacity: allowed ? 1 : 0.5,
                }}
              >
                {f.label}
                {!allowed && " 🔒"}
              </button>
            );
          })}
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 11,
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          {showAdvanced ? "▾ Hide advanced" : "▸ Advanced options"}
        </button>

        {showAdvanced && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>
              CSS Selector {plan === "free" && <span style={{ color: "var(--accent-gold)" }}>(Pro)</span>}
            </label>
            <input
              className="input"
              value={cssSelector}
              onChange={(e) => setCssSelector(e.target.value)}
              placeholder=".main-content, #price"
              disabled={plan === "free"}
            />
          </div>
        )}

        {error && (
          <p style={{ color: "var(--accent-ruby)", fontSize: 11, marginBottom: 8 }}>{error}</p>
        )}

        <button className="btn-primary" type="submit" disabled={loading || !pageUrl.trim()}>
          {loading ? "Creating..." : "Start Monitoring"}
        </button>
      </form>
    </div>
  );
}
