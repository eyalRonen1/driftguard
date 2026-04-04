"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const OAUTH_PROVIDERS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  apple: "Apple",
};

function getAllTimezones(): { value: string; label: string }[] {
  try {
    const zones = Intl.supportedValuesOf("timeZone");
    return zones.map((tz) => {
      const now = new Date();
      const offset = new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "shortOffset" })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value || "";
      const city = tz.split("/").pop()?.replace(/_/g, " ") || tz;
      return { value: tz, label: `${city} (${offset})` };
    });
  } catch {
    return [{ value: "UTC", label: "UTC" }];
  }
}

export function SettingsForm({
  email,
  name: initialName,
  authProvider,
  timezone: initialTimezone = "UTC",
}: {
  email: string;
  name: string;
  authProvider: string;
  timezone?: string;
}) {
  const [name, setName] = useState(initialName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [tzSearch, setTzSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const allTimezones = useMemo(() => getAllTimezones(), []);
  const filteredTimezones = useMemo(() => {
    if (!tzSearch) return allTimezones;
    const q = tzSearch.toLowerCase();
    return allTimezones.filter((tz) => tz.label.toLowerCase().includes(q) || tz.value.toLowerCase().includes(q));
  }, [allTimezones, tzSearch]);

  const isOAuth = authProvider !== "email";
  const providerName = OAUTH_PROVIDERS[authProvider] || authProvider;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone }),
      });

      if (!res.ok) throw new Error();
      setMessage("Saved!");
    } catch {
      setMessage("Failed to update");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      {/* Name + Timezone */}
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label htmlFor="settings-name" className="text-xs text-muted-foreground mb-1 block">Name</label>
          <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="settings-timezone" className="text-xs text-muted-foreground mb-1 block">Timezone</label>
          <input
            type="text"
            placeholder="Search timezone..."
            value={tzSearch}
            onChange={(e) => setTzSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg rounded-b-none text-[var(--text-cream)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-jade)] placeholder:text-[var(--text-muted)]/40"
          />
          <select
            id="settings-timezone"
            value={timezone}
            onChange={(e) => { setTimezone(e.target.value); setTzSearch(""); }}
            size={6}
            className="w-full px-1 py-1 text-sm bg-white/5 border border-white/10 border-t-0 rounded-lg rounded-t-none text-[var(--text-cream)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-jade)]"
          >
            {filteredTimezones.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground mt-1">Used for schedule times and notifications.</p>
        </div>
        {message && (
          <p className={`text-xs ${message.includes("Failed") ? "text-destructive" : "text-primary"}`}>{message}</p>
        )}
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </form>

      {/* Email - read-only for OAuth */}
      <div className="space-y-3 pt-3 border-t border-border/30">
        <div>
          <label htmlFor="settings-email" className="text-xs text-muted-foreground mb-1 block">Email</label>
          <Input
            id="settings-email"
            type="email"
            value={email}
            disabled
            className="opacity-70"
          />
          {isOAuth ? (
            <p className="text-[10px] text-muted-foreground mt-1">
              Signed in with {providerName}. Email is managed by your {providerName} account.
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground mt-1">
              To change your email, contact support@zikit.ai
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
