import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Connect Zikit with your favorite tools. OpenClaw, Telegram, Slack, Discord, webhooks, and more.",
};

export default function IntegrationsPage() {
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
        <div className="grid sm:grid-cols-2 gap-6 mb-10 max-w-lg mx-auto">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl"><Image src="/assets/page-integrations-1.webp" alt="Camo connecting tools" width={512} height={512} className="w-full" /></div>
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl hidden sm:block"><Image src="/assets/page-integrations-2.webp" alt="Camo juggling platforms" width={512} height={512} className="w-full" /></div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center">Integrations</h1>
        <p className="text-[var(--text-sage)] text-lg mb-12 text-center max-w-lg mx-auto">
          Connect Zikit with the tools you already use.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* OpenClaw */}
          <Link href="/integrations/openclaw" className="card-glass card-lift rounded-2xl p-6 block">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-1">OpenClaw</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">AI agent for Telegram, WhatsApp, Discord. Ask about changes in natural language.</p>
            <span className="text-xs text-[var(--accent-jade)] font-medium">View setup guide</span>
          </Link>

          {/* Slack */}
          <div className="card-glass rounded-2xl p-6 opacity-80">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-1">Slack</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">Get change alerts directly in your Slack channels. Pro plan and above.</p>
            <span className="text-xs text-[var(--accent-jade)] font-medium">Built-in - configure per monitor</span>
          </div>

          {/* Telegram */}
          <div className="card-glass rounded-2xl p-6 opacity-80">
            <div className="text-3xl mb-3">✈️</div>
            <h3 className="font-bold text-lg mb-1">Telegram</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">Receive bot alerts for every change. Pro plan and above.</p>
            <span className="text-xs text-[var(--accent-jade)] font-medium">Built-in - configure per monitor</span>
          </div>

          {/* Discord */}
          <div className="card-glass rounded-2xl p-6 opacity-80">
            <div className="text-3xl mb-3">🎮</div>
            <h3 className="font-bold text-lg mb-1">Discord</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">Server webhook notifications for your team. Pro plan and above.</p>
            <span className="text-xs text-[var(--accent-jade)] font-medium">Built-in - configure per monitor</span>
          </div>

          {/* Webhooks */}
          <div className="card-glass rounded-2xl p-6 opacity-80">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-bold text-lg mb-1">Custom Webhooks</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">POST JSON payloads to any endpoint. Business plan.</p>
            <span className="text-xs text-[var(--accent-jade)] font-medium">Built-in - configure per monitor</span>
          </div>

          {/* API */}
          <div className="card-glass rounded-2xl p-6 opacity-80">
            <div className="text-3xl mb-3">🔑</div>
            <h3 className="font-bold text-lg mb-1">REST API</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">Full API access for custom integrations and automation. Business plan.</p>
            <span className="text-xs text-[var(--accent-jade)] font-medium">Generate keys in Settings</span>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
