import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Zikit REST API documentation. Manage monitors, check changes, and configure alerts programmatically.",
};

const BASE = "https://zikit.ai";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/monitors",
    desc: "List all monitors",
    response: `{
  "monitors": [
    {
      "id": "uuid",
      "name": "Competitor Pricing",
      "url": "https://example.com/pricing",
      "checkFrequency": "hourly",
      "healthStatus": "healthy",
      "lastCheckedAt": "2026-04-04T12:00:00Z",
      "totalChanges": 5,
      "totalChecks": 120
    }
  ],
  "plan": "business"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/monitors/:id",
    desc: "Get monitor details + recent changes",
    response: `{
  "monitor": { "id": "uuid", "name": "...", "url": "...", ... },
  "changes": [
    {
      "id": "uuid",
      "summary": "Pro plan price dropped from $49 to $39",
      "importanceScore": 8,
      "changeType": "price",
      "createdAt": "2026-04-04T12:00:00Z"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/monitors/:id/changes",
    desc: "List changes for a monitor (JSON). Supports ?limit=N (max 100, default 20)",
    response: `{
  "changes": [
    {
      "id": "uuid",
      "summary": "Pro plan price dropped from $49 to $39",
      "importanceScore": 8,
      "changeType": "price",
      "details": "Pricing page updated...",
      "actionItem": "Consider adjusting your pricing",
      "keywordMatched": true,
      "createdAt": "2026-04-04T12:00:00Z"
    }
  ],
  "count": 1
}`,
  },
  {
    method: "POST",
    path: "/api/v1/monitors",
    desc: "Create a new monitor",
    body: `{
  "url": "https://example.com/pricing",
  "name": "Competitor Pricing",
  "checkFrequency": "hourly",
  "useCase": "competitor",
  "watchKeywords": "price, sale, discount",
  "cssSelector": "#pricing-table"
}`,
    response: `{ "monitor": { "id": "uuid", "name": "...", ... } }`,
  },
  {
    method: "PATCH",
    path: "/api/v1/monitors/:id",
    desc: "Update monitor settings",
    body: `{
  "checkFrequency": "daily",
  "watchKeywords": "new-keyword",
  "isPaused": false
}`,
    response: `{ "monitor": { ... } }`,
  },
  {
    method: "DELETE",
    path: "/api/v1/monitors/:id",
    desc: "Delete a monitor",
    response: `{ "success": true }`,
  },
  {
    method: "POST",
    path: "/api/v1/monitors/:id/check",
    desc: "Trigger a manual check",
    response: `{
  "changed": true,
  "summary": "Price changed from $49 to $39",
  "importanceScore": 8
}`,
  },
  {
    method: "GET",
    path: "/api/v1/alert-configs?monitorId=:id",
    desc: "Get alert preferences for a monitor",
    response: `{ "configs": [{ "channel": "email", "destination": "...", "minImportance": 3, "isActive": true }] }`,
  },
  {
    method: "POST",
    path: "/api/v1/alert-configs",
    desc: "Create or update alert config",
    body: `{
  "monitorId": "uuid",
  "channel": "email",
  "destination": "user@example.com",
  "minImportance": 3,
  "isActive": true
}`,
    response: `{ "config": { ... } }`,
  },
  {
    method: "GET",
    path: "/api/v1/changes/export",
    desc: "Export all changes as CSV",
    response: `CSV file download (Content-Type: text/csv)`,
  },
  {
    method: "GET",
    path: "/api/v1/monitors/:id/export",
    desc: "Export changes for a specific monitor as CSV",
    response: `CSV file download (Content-Type: text/csv)`,
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-[var(--accent-jade)]/15 text-[var(--accent-jade)]",
  POST: "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]",
  PATCH: "bg-blue-500/15 text-blue-400",
  DELETE: "bg-[var(--accent-ruby)]/15 text-[var(--accent-ruby)]",
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-jungle-stage text-[var(--text-cream)]">
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <Image src="/assets/zikit-nav-logo.webp" alt="Zikit" width={150} height={50} className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-sage)] hover:text-[var(--text-cream)] transition hidden sm:block">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm !py-1.5 !px-4">Get started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl"><Image src="/assets/page-docs-1.webp" alt="Camo coding" width={512} height={512} className="w-full" /></div>
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl hidden sm:block"><Image src="/assets/page-docs-2.webp" alt="Camo connecting APIs" width={512} height={512} className="w-full" /></div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-3">API Documentation</h1>
        <p className="text-[var(--text-sage)] text-lg mb-4">
          Manage monitors, check changes, and configure alerts programmatically.
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-10">
          API access requires a <strong className="text-[var(--text-cream)]">Business plan</strong> and an API key. Generate keys in{" "}
          <Link href="/dashboard/settings" className="text-[var(--accent-jade)] hover:underline">Settings</Link>.
        </p>

        {/* Auth */}
        <div className="card-glass rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">Authentication</h2>
          <p className="text-sm text-[var(--text-sage)] mb-4">
            All requests require a Bearer token in the Authorization header:
          </p>
          <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-[var(--accent-jade)] overflow-x-auto">
            Authorization: Bearer zk_live_your_api_key_here
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            Base URL: <code className="text-[var(--accent-jade)]">{BASE}</code> | Rate limit: 30 req/min | Format: JSON
          </p>
        </div>

        {/* Endpoints */}
        <h2 className="text-xl font-bold mb-6">Endpoints</h2>
        <div className="space-y-6">
          {endpoints.map((ep, i) => (
            <div key={i} className="card-glass rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${methodColors[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-sm text-[var(--text-cream)] font-mono">{ep.path}</code>
              </div>
              {/* Body */}
              <div className="p-4">
                <p className="text-sm text-[var(--text-sage)] mb-3">{ep.desc}</p>
                {ep.body && (
                  <div className="mb-3">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-1">Request body</p>
                    <pre className="bg-black/30 rounded-lg p-3 text-xs font-mono text-[var(--text-sage)] overflow-x-auto">{ep.body}</pre>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-1">Response</p>
                  <pre className="bg-black/30 rounded-lg p-3 text-xs font-mono text-[var(--text-sage)] overflow-x-auto">{ep.response}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fields reference */}
        <div className="card-glass rounded-2xl p-6 mt-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Monitor fields reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="p-2 text-[var(--text-muted)] font-medium">Field</th>
                  <th className="p-2 text-[var(--text-muted)] font-medium">Type</th>
                  <th className="p-2 text-[var(--text-muted)] font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["url", "string", "URL to monitor (required)"],
                  ["name", "string", "Display name (required)"],
                  ["checkFrequency", "string", "daily, hourly, every_6h, weekly, 15min"],
                  ["cssSelector", "string", "CSS selector to monitor specific element"],
                  ["ignoreSelectors", "string", "Comma-separated selectors to exclude"],
                  ["watchKeywords", "string", "Comma-separated keywords to watch"],
                  ["keywordMode", "string", "any (default), appear, disappear"],
                  ["useCase", "string", "competitor, regulatory, ecommerce, jobs, content, custom"],
                  ["description", "string", "Notes about why you track this page"],
                  ["tags", "string", "Comma-separated tags"],
                  ["isPaused", "boolean", "Pause/resume monitoring"],
                ].map(([field, type, desc]) => (
                  <tr key={field}>
                    <td className="p-2"><code className="text-xs text-[var(--accent-jade)] font-mono">{field}</code></td>
                    <td className="p-2 text-[var(--text-muted)]">{type}</td>
                    <td className="p-2 text-[var(--text-sage)]">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert channels */}
        <div className="card-glass rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Alert channels</h2>
          <p className="text-sm text-[var(--text-sage)] mb-3">Available channels for the <code className="text-[var(--accent-jade)]">POST /alert-configs</code> endpoint:</p>
          <div className="space-y-2">
            {[
              ["email", "Email address", "All plans"],
              ["slack", "Slack webhook URL", "Pro+"],
              ["discord", "Discord webhook URL", "Pro+"],
              ["telegram", "BOT_TOKEN:CHAT_ID", "Pro+"],
              ["webhook", "Any HTTPS URL (POST JSON)", "Business"],
            ].map(([channel, dest, plan]) => (
              <div key={channel} className="flex items-center gap-3 text-sm">
                <code className="text-xs text-[var(--accent-jade)] font-mono w-20">{channel}</code>
                <span className="text-[var(--text-sage)] flex-1">{dest}</span>
                <span className="text-xs text-[var(--text-muted)]">{plan}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Errors */}
        <div className="card-glass rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Error codes</h2>
          <div className="space-y-2">
            {[
              ["401", "Unauthorized - invalid or missing API key"],
              ["403", "Forbidden - feature requires a higher plan"],
              ["404", "Not found - monitor doesn't exist or wrong org"],
              ["429", "Rate limited - too many requests"],
              ["400", "Bad request - invalid input"],
            ].map(([code, desc]) => (
              <div key={code} className="flex items-center gap-3 text-sm">
                <code className="text-xs font-mono text-[var(--accent-ruby)] w-10">{code}</code>
                <span className="text-[var(--text-sage)]">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Need help? <a href="mailto:support@zikit.ai" className="text-[var(--accent-jade)] hover:underline">support@zikit.ai</a>
          </p>
          <Link href="/integrations" className="text-sm text-[var(--accent-jade)] hover:underline">View integrations (OpenClaw, Slack, Telegram)</Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
