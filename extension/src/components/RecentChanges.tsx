import { useState, useEffect } from "react";
import { getMonitors, getMonitor } from "@/lib/api";

interface ChangeItem {
  id: string;
  monitorName: string;
  monitorUrl: string;
  summary: string;
  importanceScore: number;
  changeType: string;
  createdAt: string;
  monitorId: string;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function importanceColor(score: number): string {
  if (score >= 7) return "var(--accent-ruby)";
  if (score >= 4) return "var(--accent-gold)";
  return "var(--text-muted)";
}

export function RecentChanges() {
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChanges() {
      try {
        const { monitors } = await getMonitors();
        // Fetch recent changes from top 5 active monitors
        const active = monitors.filter((m: any) => m.isActive && !m.isPaused).slice(0, 5);
        const allChanges: ChangeItem[] = [];

        await Promise.all(active.map(async (m: any) => {
          try {
            const data = await getMonitor(m.id);
            if (data.changes) {
              for (const c of data.changes.slice(0, 3)) {
                allChanges.push({
                  id: c.id,
                  monitorName: m.name,
                  monitorUrl: m.url,
                  summary: c.summary || "Change detected",
                  importanceScore: c.importanceScore || 3,
                  changeType: c.changeType || "update",
                  createdAt: c.createdAt,
                  monitorId: m.id,
                });
              }
            }
          } catch {}
        }));

        // Sort by date, take latest 8
        allChanges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setChanges(allChanges.slice(0, 8));
      } catch {}
      setLoading(false);
    }
    fetchChanges();
  }, []);

  if (loading || changes.length === 0) return null;

  return (
    <div>
      <div style={{ padding: "8px 14px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Recent Changes
        </span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{changes.length}</span>
      </div>

      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {changes.map((c) => (
          <a
            key={c.id}
            href={`https://zikit.ai/dashboard/monitors/${c.monitorId}`}
            target="_blank"
            rel="noopener"
            style={{
              display: "block",
              padding: "8px 14px",
              textDecoration: "none",
              color: "inherit",
              borderTop: "1px solid var(--border-subtle)",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--accent-jade)" }}>
                {c.monitorName}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
                {timeAgo(c.createdAt)}
              </span>
            </div>
            <p style={{
              fontSize: 11,
              color: "var(--text-sage)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
              margin: 0,
            }}>
              {c.summary}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                color: importanceColor(c.importanceScore),
              }}>
                {c.importanceScore}/10
              </span>
              <span className="badge badge-muted" style={{ fontSize: 9 }}>
                {c.changeType}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
