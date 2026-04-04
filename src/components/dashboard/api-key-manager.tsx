"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function fetchKeys() {
    try {
      const res = await fetch("/api/v1/extension/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchKeys(); }, []);

  async function handleCreate() {
    setCreating(true);
    setError("");
    setNewKey(null);
    try {
      const res = await fetch("/api/v1/extension/keys", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create key");
      setNewKey(data.key);
      fetchKeys();
    } catch (err: any) {
      setError(err.message);
    }
    setCreating(false);
  }

  async function handleRevoke(id: string) {
    try {
      await fetch(`/api/v1/extension/keys?id=${id}`, { method: "DELETE" });
      fetchKeys();
    } catch {}
  }

  function handleCopy() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-4">
      {/* New key banner */}
      {newKey && (
        <div className="p-3 rounded-lg bg-[var(--accent-jade)]/10 border border-[var(--accent-jade)]/20">
          <p className="text-xs text-[var(--accent-jade)] font-medium mb-2">
            API key created! Copy it now  - you won't see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-black/30 px-3 py-1.5 rounded font-mono text-[var(--text-cream)] break-all">
              {newKey}
            </code>
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Key list */}
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : keys.length > 0 ? (
        <div className="space-y-2">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 border border-border/20">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-muted-foreground">{key.keyPrefix}...xxxx</code>
                  <span className="text-[10px] text-muted-foreground">{key.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {key.lastUsedAt
                    ? `Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`
                    : "Never used"
                  }
                  {" · Created: "}
                  {new Date(key.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive text-xs"
                onClick={() => handleRevoke(key.id)}
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No API keys yet. Generate one to connect the Chrome Extension.
        </p>
      )}

      {/* Create button */}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleCreate} disabled={creating || keys.length >= 3}>
          {creating ? "Generating..." : "Generate API Key"}
        </Button>
        {keys.length >= 3 && (
          <span className="text-[10px] text-muted-foreground">Max 3 keys. Revoke one to create a new one.</span>
        )}
      </div>
    </div>
  );
}
