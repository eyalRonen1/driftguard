"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface OrgData {
  plan: string;
  monthlyScanQuota: number;
  monthlyScansUsed: number;
}

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState<OrgData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setName(user.user_metadata?.full_name || "");
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });

    if (error) {
      setMessage("Failed to update profile");
    } else {
      setMessage("Profile updated");
    }
    setSaving(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-cream)] mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="card-glass rounded-xl border border-white/8 p-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-sage)] mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-white/8 rounded-lg bg-white/4 text-[var(--text-muted)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-sage)] mb-1">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-jade)]"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.includes("Failed") ? "text-[var(--accent-ruby)]" : "text-[var(--accent-jade)]"}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 btn-primary transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Plan */}
        <div className="card-glass rounded-xl border border-white/8 p-6">
          <h2 className="text-lg font-semibold mb-4">Plan & Usage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Current plan</p>
              <p className="text-lg font-semibold capitalize">Free</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Scans this month</p>
              <p className="text-lg font-semibold">0 / 30</p>
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-white/6 text-[var(--text-sage)] rounded-lg hover:bg-white/10 transition">
            Upgrade plan
          </button>
        </div>

        {/* Danger zone */}
        <div className="card-glass rounded-xl border border-[var(--accent-ruby)]/20 p-6">
          <h2 className="text-lg font-semibold text-[var(--accent-ruby)] mb-2">Danger Zone</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Deleting your account will permanently remove all chatbots, test cases, and scan history.
          </p>
          <button className="px-4 py-2 border border-[var(--accent-ruby)]/30 text-[var(--accent-ruby)] rounded-lg hover:bg-[var(--accent-ruby)]/10 transition">
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
