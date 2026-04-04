import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BlogRelated } from "@/components/shared/blog-related";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Zikit API and Integrations: Telegram Bots, Slack, Discord, Webhooks",
  description: "Connect Zikit to your workflow with REST API, Telegram bots, Slack alerts, Discord webhooks, and custom integrations.",
  alternates: { canonical: "https://zikit.ai/blog/api-integrations-telegram-slack-webhooks" },
  openGraph: { title: "API and Integrations: Telegram, Slack, Discord, Webhooks", description: "Connect Zikit to your workflow with REST API and messaging platforms.", images: [{ url: "/assets/blog-api-hero-og.jpg", width: 1200, height: 630, alt: "API and Integrations: Telegram, Slack, Discord, Webhooks" }] },
  keywords: "website monitoring API, telegram bot website changes, slack website monitoring alerts, webhook website change notification",
};

export default function BlogPost() {
  return (
    <main className="min-h-screen bg-jungle-stage text-[var(--text-cream)]">
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/"><Image src="/assets/zikit-nav-logo.webp" alt="Zikit" width={150} height={50} className="h-10 w-auto" /></Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-[var(--text-sage)] hover:text-[var(--text-cream)] transition hidden sm:block">Blog</Link>
            <Link href="/signup" className="btn-primary text-sm !py-1.5 !px-4">Get started</Link>
          </div>
        </div>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: "API and Integrations: Telegram, Slack, Discord, Webhooks", description: "Connect Zikit to your workflow with REST API and messaging platforms.", image: "https://zikit.ai/assets/blog-api-hero.webp", datePublished: "2026-04-04", author: { "@type": "Organization", name: "Zikit" }, publisher: { "@type": "Organization", name: "Zikit", logo: { "@type": "ImageObject", url: "https://zikit.ai/assets/zikit-nav-logo.webp" } } }) }} />
      <article className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-jade)] transition inline-flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Back to blog
        </Link>

        <div className="mb-8">
          <time dateTime="2026-04-04" className="text-sm text-[var(--accent-gold)] mb-2 block">April 4, 2026</time>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">API and Integrations: Connect Zikit to Telegram, Slack, Discord, and More</h1>
          <p className="text-[var(--text-sage)] text-lg">Get change alerts where your team already works.</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-10">
          <Image src="/assets/blog-api-hero.webp" alt="Camo at the integration command center" width={896} height={512} className="w-full" />
        </div>

        <div className="prose-dark space-y-6 text-[var(--text-sage)] text-base leading-relaxed">
          <p>The best alert is the one you actually see. If your team lives in Slack, that's where change notifications should go. If you're on the move, Telegram. If you're building custom automation, webhooks and the REST API.</p>
          <p>Zikit supports all of these out of the box.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Built-in alert channels</h2>
          <p>Every monitor in Zikit can send alerts to multiple channels simultaneously. Set them up per monitor - one can alert via email, another via Slack, a third via all channels at once.</p>

          <div className="grid sm:grid-cols-2 gap-3 my-6">
            {[
              { name: "Email", desc: "Instant alerts with AI summary, importance score, and direct link to the change. Works on all plans.", plan: "All plans" },
              { name: "Slack", desc: "Post to any Slack channel via incoming webhook. Includes formatted message with change summary and link.", plan: "Pro" },
              { name: "Discord", desc: "Server webhook notifications. Great for team awareness channels.", plan: "Pro" },
              { name: "Telegram", desc: "Bot messages directly to your chat or group. Configure with BotFather token and chat ID.", plan: "Pro" },
              { name: "Custom Webhooks", desc: "POST JSON payload to any HTTPS endpoint. Build your own integrations, trigger Zapier/n8n/Make workflows.", plan: "Business" },
            ].map((ch) => (
              <div key={ch.name} className="card-glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[var(--text-cream)]">{ch.name}</h3>
                  <span className="text-[10px] text-[var(--accent-jade)] font-medium">{ch.plan}</span>
                </div>
                <p className="text-sm">{ch.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">The REST API</h2>
          <p>For power users and developers, Zikit offers a full REST API (Business plan). Everything you can do in the dashboard, you can do programmatically:</p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-[var(--text-cream)]">List and manage monitors</strong> - Create, update, pause, delete</li>
            <li><strong className="text-[var(--text-cream)]">Trigger manual checks</strong> - Force a check on demand</li>
            <li><strong className="text-[var(--text-cream)]">Get changes as JSON</strong> - Full change history with AI summaries, importance scores, diffs</li>
            <li><strong className="text-[var(--text-cream)]">Export as CSV</strong> - Bulk export for reporting</li>
            <li><strong className="text-[var(--text-cream)]">Manage alert configs</strong> - Set up and modify notification preferences</li>
          </ul>

          <div className="bg-black/30 rounded-lg p-4 font-mono text-xs my-6">
            <p className="text-[var(--text-muted)]"># List all monitors</p>
            <p className="text-[var(--accent-jade)]">curl -H "Authorization: Bearer zk_live_xxx" \</p>
            <p className="text-[var(--accent-jade)]">&nbsp;&nbsp;https://zikit.ai/api/v1/monitors</p>
          </div>

          <p>Full documentation is available at <Link href="/docs" className="text-[var(--accent-jade)] hover:underline">zikit.ai/docs</Link>.</p>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl my-10">
            <Image src="/assets/blog-api-inline.webp" alt="Camo connecting services" width={896} height={512} className="w-full" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">OpenClaw integration</h2>
          <p>For the ultimate automation, connect Zikit to <Link href="/integrations/openclaw" className="text-[var(--accent-jade)] hover:underline">OpenClaw</Link> - a local AI agent that runs on your device. OpenClaw connects to Telegram, WhatsApp, Discord, or any messaging app. Ask it "what changed on my monitors?" and it pulls data from Zikit's API and gives you a natural language answer.</p>

          <p>This means you can manage your entire monitoring setup from a Telegram chat - check changes, create monitors, adjust settings - all through conversation.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Which plan do I need?</h2>
          <div className="card-glass rounded-xl p-4 my-4">
            <div className="space-y-2 text-sm">
              <p><strong className="text-[var(--text-cream)]">Free</strong> - Email alerts only</p>
              <p><strong className="text-[var(--text-cream)]">Pro ($19/mo)</strong> - Email + Slack + Discord + Telegram</p>
              <p><strong className="text-[var(--text-cream)]">Business ($49/mo)</strong> - All channels + Custom webhooks + REST API + API keys</p>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-6 text-center mt-10">
            <p className="text-lg font-semibold text-[var(--text-cream)] mb-2">Connect your workflow</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">Start with email alerts on the free plan. Upgrade when you need more.</p>
            <Link href="/signup" className="btn-primary text-base">Get started free</Link>
          </div>
        </div>
      </article>

      <div className="max-w-3xl mx-auto px-6 pb-10"><BlogRelated currentSlug="api-integrations-telegram-slack-webhooks" /></div>
      <SiteFooter />
    </main>
  );
}
