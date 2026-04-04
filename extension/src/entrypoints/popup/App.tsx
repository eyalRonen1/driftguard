import { useState, useEffect } from "react";
import { getAuth } from "@/lib/storage";
import { AuthGate } from "@/components/AuthGate";
import { QuickAdd } from "@/components/QuickAdd";
import { MonitorList } from "@/components/MonitorList";
import { RecentChanges } from "@/components/RecentChanges";

type View = "loading" | "auth" | "main" | "add";

export default function App() {
  const [view, setView] = useState<View>("loading");
  const [tabUrl, setTabUrl] = useState("");
  const [tabTitle, setTabTitle] = useState("");

  useEffect(() => {
    // Clear badge and mark as seen when popup opens
    chrome.action.setBadgeText({ text: "" });
    chrome.storage.local.set({ zikit_last_seen: new Date().toISOString() });

    // Check auth and read active tab
    Promise.all([
      getAuth(),
      chrome.tabs.query({ active: true, currentWindow: true }),
    ]).then(([auth, tabs]) => {
      if (tabs[0]) {
        setTabUrl(tabs[0].url || "");
        setTabTitle(tabs[0].title || "");
      }
      setView(auth ? "main" : "auth");
    }).catch(() => {
      setView("auth");
    });
  }, []);

  if (view === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Loading...</div>
      </div>
    );
  }

  if (view === "auth") {
    return <AuthGate onSuccess={() => setView("main")} />;
  }

  if (view === "add") {
    return (
      <QuickAdd
        url={tabUrl}
        title={tabTitle}
        onBack={() => setView("main")}
        onCreated={() => setView("main")}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/icon/48.png" alt="" width={20} height={20} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Zikit</span>
        </div>
        <a
          href="https://zikit.ai/dashboard"
          target="_blank"
          rel="noopener"
          style={{ color: "var(--text-muted)", fontSize: 11, textDecoration: "none" }}
        >
          Dashboard ↗
        </a>
      </div>

      {/* Quick Add CTA */}
      <div style={{ padding: "12px 14px" }}>
        <button
          className="btn-primary"
          onClick={() => setView("add")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Monitor This Page
        </button>
        {tabUrl && (
          <p style={{
            color: "var(--text-muted)",
            fontSize: 10,
            marginTop: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {tabUrl}
          </p>
        )}
      </div>

      {/* Monitor List */}
      {/* Recent Changes */}
      <RecentChanges />

      {/* Monitors */}
      <MonitorList />

      {/* Footer */}
      <div style={{
        padding: "8px 14px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <a
          href="https://zikit.ai/dashboard/settings"
          target="_blank"
          rel="noopener"
          style={{ color: "var(--text-muted)", fontSize: 10, textDecoration: "none" }}
        >
          Settings
        </a>
        <button
          onClick={async () => {
            const { clearAuth } = await import("@/lib/storage");
            await clearAuth();
            setView("auth");
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 10,
            cursor: "pointer",
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
