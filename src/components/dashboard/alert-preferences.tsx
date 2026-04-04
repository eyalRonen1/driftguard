"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

/**
 * Alert Preferences - Per-monitor notification settings.
 * User configures: minimum importance, channels, quiet hours.
 */

const IMPORTANCE_LEVELS = [
  { value: 1, label: "Everything", desc: "All changes, even minor", color: "bg-muted" },
  { value: 3, label: "Notable+", desc: "Skip trivial changes", color: "bg-chart-2/20" },
  { value: 5, label: "Important+", desc: "Only meaningful changes", color: "bg-chart-2/40" },
  { value: 7, label: "Critical only", desc: "Only major changes", color: "bg-destructive/20" },
];

export function AlertPreferences({
  monitorId,
  monitorName,
  userEmail,
  plan = "free",
  currentThreshold = 3,
  emailEnabled = true,
  slackEnabled = false,
  emailUnsubscribedAt = null,
}: {
  monitorId: string;
  monitorName: string;
  userEmail: string;
  plan?: string;
  currentThreshold?: number;
  emailEnabled?: boolean;
  slackEnabled?: boolean;
  emailUnsubscribedAt?: string | null;
}) {
  const canSlack = plan === "pro" || plan === "business";
  const canWebhook = plan === "business";
  const canDiscord = plan === "pro" || plan === "business";
  const [emailPaused, setEmailPaused] = useState(!!emailUnsubscribedAt);
  const canTelegram = plan === "pro" || plan === "business";
  const [threshold, setThreshold] = useState(currentThreshold);
  const [email, setEmail] = useState(emailEnabled);
  const [slack, setSlack] = useState(slackEnabled);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [webhook, setWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [discord, setDiscord] = useState(false);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [telegram, setTelegram] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing configs on mount
  const loadConfigs = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/alert-configs?monitorId=${monitorId}`);
      if (!res.ok) return;
      const data = await res.json();
      const configs = data.configs || [];

      const emailConfig = configs.find((c: { channel: string }) => c.channel === "email");
      const slackConfig = configs.find((c: { channel: string }) => c.channel === "slack");
      const webhookConfig = configs.find((c: { channel: string }) => c.channel === "webhook");
      const discordConfig = configs.find((c: { channel: string }) => c.channel === "discord");
      const telegramConfig = configs.find((c: { channel: string }) => c.channel === "telegram");

      if (emailConfig) {
        setEmail(emailConfig.isActive);
        setThreshold(emailConfig.minImportance);
      } else {
        setEmail(false);
      }

      if (slackConfig) {
        setSlack(slackConfig.isActive);
        if (slackConfig.destination) setSlackWebhookUrl(slackConfig.destination);
      } else {
        setSlack(false);
      }

      if (webhookConfig) {
        setWebhook(webhookConfig.isActive);
        if (webhookConfig.destination) setWebhookUrl(webhookConfig.destination);
      } else {
        setWebhook(false);
      }

      if (discordConfig) {
        setDiscord(discordConfig.isActive);
        if (discordConfig.destination) setDiscordWebhookUrl(discordConfig.destination);
      } else {
        setDiscord(false);
      }

      if (telegramConfig) {
        setTelegram(telegramConfig.isActive);
        if (telegramConfig.destination) setTelegramConfig(telegramConfig.destination);
      } else {
        setTelegram(false);
      }
    } catch {
      // Silently fail on load  - defaults are fine
    } finally {
      setLoading(false);
    }
  }, [monitorId]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    // If we don't have the email yet, try to get it from Supabase
    let emailDest = userEmail;
    if (!emailDest && email) {
      try {
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await supabase.auth.getUser();
        emailDest = data.user?.email || "";
      } catch {}
    }

    try {
      // Save email config
      if (email && emailDest) {
        const emailRes = await fetch("/api/v1/alert-configs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monitorId,
            channel: "email",
            destination: emailDest,
            minImportance: threshold,
            isActive: true,
          }),
        });

        if (!emailRes.ok) {
          const data = await emailRes.json();
          throw new Error(data.error || "Failed to save email config");
        }
      } else if (!email) {
        // Disable email alerts  - send isActive: false with a placeholder
        if (emailDest) {
          await fetch("/api/v1/alert-configs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              monitorId,
              channel: "email",
              destination: emailDest,
              minImportance: threshold,
              isActive: false,
            }),
          });
        }
      }

      // Save each optional channel if enabled AND destination is provided
      const optionalChannels = [
        { enabled: slack, channel: "slack", destination: slackWebhookUrl.trim() },
        { enabled: webhook, channel: "webhook", destination: webhookUrl.trim() },
        { enabled: discord, channel: "discord", destination: discordWebhookUrl.trim() },
        { enabled: telegram, channel: "telegram", destination: telegramConfig.trim() },
      ];

      for (const ch of optionalChannels) {
        if (ch.enabled && ch.destination) {
          const res = await fetch("/api/v1/alert-configs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              monitorId,
              channel: ch.channel,
              destination: ch.destination,
              minImportance: threshold,
              isActive: true,
            }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || `Failed to save ${ch.channel} config`);
          }
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Image src="/assets/camo-happy.webp" alt="" width={24} height={24} />
          Alert preferences for {monitorName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading preferences...</p>
        ) : (
          <>
            {/* Email unsubscribe warning */}
            {emailPaused && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs font-medium text-amber-400">Email alerts are paused</p>
                <p className="text-[10px] text-muted-foreground mt-1 mb-2">
                  You unsubscribed from Zikit emails. No email alerts will be sent until you re-enable them.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true);
                    setError(null);
                    try {
                      let emailDest = userEmail;
                      if (!emailDest) {
                        const { createBrowserClient } = await import("@supabase/ssr");
                        const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                        const { data } = await supabase.auth.getUser();
                        emailDest = data.user?.email || "";
                      }
                      if (!emailDest) throw new Error("Could not load email");
                      const res = await fetch("/api/v1/alert-configs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ monitorId, channel: "email", destination: emailDest, minImportance: threshold, isActive: true }),
                      });
                      if (!res.ok) throw new Error("Failed to re-enable");
                      setEmail(true);
                      setEmailPaused(false);
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed");
                    } finally { setSaving(false); }
                  }}
                >
                  Re-enable email alerts
                </Button>
              </div>
            )}

            {/* Importance threshold */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Minimum importance to alert</p>
              <div className="grid grid-cols-2 gap-2">
                {IMPORTANCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setThreshold(level.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      threshold === level.value
                        ? "border-primary bg-primary/10"
                        : "border-border/30 hover:border-border/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${level.color}`} />
                      <span className="text-sm font-medium">{level.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Channels */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Alert channels</p>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-lg border border-border/30 cursor-pointer hover:border-border/60 transition">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📧</span>
                    <span className="text-sm">Email</span>
                    {emailPaused && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-400 border-amber-400/30">Paused</Badge>}
                  </div>
                  <input
                    type="checkbox"
                    checked={email}
                    onChange={(e) => setEmail(e.target.checked)}
                    className="rounded border-border"
                  />
                </label>
                <label className={`flex items-center justify-between p-3 rounded-lg border border-border/30 transition ${canSlack ? "cursor-pointer hover:border-border/60" : "opacity-50 cursor-not-allowed"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span className="text-sm">Slack</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{canSlack ? "Pro" : "Upgrade to Pro"}</Badge>
                  </div>
                  <input
                    type="checkbox"
                    checked={slack && canSlack}
                    onChange={(e) => canSlack && setSlack(e.target.checked)}
                    disabled={!canSlack}
                    className="rounded border-border"
                  />
                </label>
                {slack && (
                  <div className="pl-7">
                    <label htmlFor="slack-webhook-url" className="sr-only">Slack webhook URL</label>
                    <input
                      id="slack-webhook-url"
                      type="url"
                      value={slackWebhookUrl}
                      onChange={(e) => setSlackWebhookUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-3 py-2 text-sm border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter your Slack incoming webhook URL</p>
                  </div>
                )}

                {/* Webhook */}
                <label className={`flex items-center justify-between p-3 rounded-lg border border-border/30 transition ${canWebhook ? "cursor-pointer hover:border-border/60" : "opacity-50 cursor-not-allowed"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔗</span>
                    <span className="text-sm">Webhook</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{canWebhook ? "Business" : "Upgrade to Business"}</Badge>
                  </div>
                  <input
                    type="checkbox"
                    checked={webhook && canWebhook}
                    onChange={(e) => canWebhook && setWebhook(e.target.checked)}
                    disabled={!canWebhook}
                    className="rounded border-border"
                  />
                </label>
                {webhook && (
                  <div className="pl-7">
                    <label htmlFor="webhook-url" className="sr-only">Webhook URL</label>
                    <input
                      id="webhook-url"
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-server.com/webhook"
                      className="w-full px-3 py-2 text-sm border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">POST JSON payload to this URL on every change</p>
                  </div>
                )}

                {/* Discord */}
                <label className={`flex items-center justify-between p-3 rounded-lg border border-border/30 transition ${canDiscord ? "cursor-pointer hover:border-border/60" : "opacity-50 cursor-not-allowed"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎮</span>
                    <span className="text-sm">Discord</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{canDiscord ? "Pro" : "Upgrade to Pro"}</Badge>
                  </div>
                  <input
                    type="checkbox"
                    checked={discord && canDiscord}
                    onChange={(e) => canDiscord && setDiscord(e.target.checked)}
                    disabled={!canDiscord}
                    className="rounded border-border"
                  />
                </label>
                {discord && (
                  <div className="pl-7">
                    <label htmlFor="discord-webhook-url" className="sr-only">Discord webhook URL</label>
                    <input
                      id="discord-webhook-url"
                      type="url"
                      value={discordWebhookUrl}
                      onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-3 py-2 text-sm border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Server Settings → Integrations → Webhooks → Copy URL</p>
                  </div>
                )}

                {/* Telegram */}
                <label className={`flex items-center justify-between p-3 rounded-lg border border-border/30 transition ${canTelegram ? "cursor-pointer hover:border-border/60" : "opacity-50 cursor-not-allowed"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">✈️</span>
                    <span className="text-sm">Telegram</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{canTelegram ? "Pro" : "Upgrade to Pro"}</Badge>
                  </div>
                  <input
                    type="checkbox"
                    checked={telegram && canTelegram}
                    onChange={(e) => canTelegram && setTelegram(e.target.checked)}
                    disabled={!canTelegram}
                    className="rounded border-border"
                  />
                </label>
                {telegram && (
                  <div className="pl-7">
                    <label htmlFor="telegram-config" className="sr-only">Telegram bot token and chat ID</label>
                    <input
                      id="telegram-config"
                      type="text"
                      value={telegramConfig}
                      onChange={(e) => setTelegramConfig(e.target.value)}
                      placeholder="123456:ABC-DEF:987654321"
                      className="w-full px-3 py-2 text-sm border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Format: BOT_TOKEN:CHAT_ID  - get token from @BotFather, chat ID from @userinfobot</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button size="sm" onClick={handleSave} disabled={saving || (!userEmail && email)} className="w-full">
              {saved ? "Saved!" : saving ? "Saving..." : "Save preferences"}
            </Button>
            {!userEmail && email && (
              <p className="text-[10px] text-muted-foreground text-center">Loading your email address...</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
