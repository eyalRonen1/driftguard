import { useState, useEffect } from "react";
import { getMonitors } from "@/lib/api";
import type { Monitor } from "@/lib/types";

function getFaviconUrl(url: string): string {
  try {
    const origin = new URL(url).origin;
    return `${origin}/favicon.ico`;
  } catch {
    return "";
  }
}

function timeAgo(date: string | null): string {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function MonitorList() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMonitors()
      .then((data) => setMonitors(data.monitors.slice(0, 10)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "16px 14px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Loading monitors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px 14px", textAlign: "center" }}>
        <p style={{ color: "var(--accent-ruby)", fontSize: 12 }}>{error}</p>
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div style={{ padding: "16px 14px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
          No monitors yet. Click "Monitor This Page" to start!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: "0 14px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Your Monitors
        </span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{monitors.length}</span>
      </div>

      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {monitors.map((m) => (
          <a
            key={m.id}
            href={`https://zikit.ai/dashboard/monitors/${m.id}`}
            target="_blank"
            rel="noopener"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              textDecoration: "none",
              color: "inherit",
              transition: "background 0.1s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {/* Favicon — fetched directly from the site, no third-party leak */}
            <img
              src={getFaviconUrl(m.url)}
              alt=""
              width={16}
              height={16}
              style={{ borderRadius: 3, flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  className={`health-dot ${m.isPaused ? "warning" : m.healthStatus === "healthy" ? "healthy" : "error"}`}
                />
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {m.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                <span className="badge badge-muted">{m.checkFrequency}</span>
                {m.totalChanges > 0 && (
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {m.totalChanges} changes
                  </span>
                )}
              </div>
            </div>

            {/* Time */}
            <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
              {timeAgo(m.lastCheckedAt)}
            </span>
          </a>
        ))}
      </div>

      {monitors.length >= 10 && (
        <div style={{ padding: "8px 14px", textAlign: "center" }}>
          <a
            href="https://zikit.ai/dashboard/monitors"
            target="_blank"
            rel="noopener"
            style={{ color: "var(--accent-jade)", fontSize: 11, textDecoration: "none" }}
          >
            View all monitors →
          </a>
        </div>
      )}
    </div>
  );
}
