"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SettingsForm({ email, name: initialName }: { email: string; name: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });

    setMessage(error ? "Failed to update" : "Saved!");
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div>
        <label htmlFor="settings-email" className="text-xs text-muted-foreground mb-1 block">Email</label>
        <Input id="settings-email" value={email} disabled className="bg-muted/30" />
      </div>
      <div>
        <label htmlFor="settings-name" className="text-xs text-muted-foreground mb-1 block">Name</label>
        <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      {message && (
        <p className={`text-xs ${message.includes("Failed") ? "text-destructive" : "text-primary"}`}>{message}</p>
      )}
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
