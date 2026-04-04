import { useState, useEffect } from "react";
import { getAuth } from "@/lib/storage";

export function AuthGate({ onSuccess }: { onSuccess: () => void }) {
  const [waitingForLogin, setWaitingForLogin] = useState(false);

  // Poll for auto-auth (background stores it after reading from auth page)
  useEffect(() => {
    if (!waitingForLogin) return;

    const interval = setInterval(async () => {
      const auth = await getAuth();
      if (auth?.apiKey) {
        clearInterval(interval);
        onSuccess();
      }
    }, 500);

    // Timeout after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setWaitingForLogin(false);
    }, 120000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [waitingForLogin, onSuccess]);

  return (
    <div style={{ padding: "28px 20px", textAlign: "center" }}>
      {/* Logo */}
      <div style={{ marginBottom: 20 }}>
        <img src="/icon/128.png" alt="Zikit" width={52} height={52} style={{ margin: "0 auto", borderRadius: 12 }} />
        <h1 style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>Zikit</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
          Website Change Monitor
        </p>
      </div>

      {waitingForLogin ? (
        <div>
          <div style={{
            width: 28, height: 28,
            border: "3px solid rgba(124,203,139,0.2)",
            borderTopColor: "var(--accent-jade)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
            Waiting for sign in...
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 4 }}>
            Complete sign in on zikit.ai, then come back here
          </p>
          <button
            className="btn-secondary"
            onClick={() => setWaitingForLogin(false)}
            style={{ marginTop: 16, fontSize: 11 }}
          >
            Cancel
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          <button
            className="btn-primary"
            onClick={() => {
              chrome.tabs.create({ url: "https://zikit.ai/auth/extension" });
              setWaitingForLogin(true);
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            Sign in / Sign up
          </button>
          <p style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 10 }}>
            Free account - no credit card needed
          </p>
        </>
      )}
    </div>
  );
}
