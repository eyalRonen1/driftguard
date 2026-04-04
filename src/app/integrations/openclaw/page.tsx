import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "OpenClaw Integration",
  description: "Connect Zikit to OpenClaw and get website change alerts directly in Telegram, WhatsApp, Discord, or any messaging app.",
};

const SKILL_RAW_URL = "https://zikit.ai/downloads/openclaw-skill.md";

export default function OpenClawPage() {
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

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">

        <div className="grid sm:grid-cols-2 gap-6 mb-10 max-w-lg mx-auto">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl"><Image src="/assets/page-openclaw-1.webp" alt="Camo and OpenClaw" width={512} height={512} className="w-full" /></div>
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl hidden sm:block"><Image src="/assets/page-openclaw-2.webp" alt="Camo messaging" width={512} height={512} className="w-full" /></div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-jade)]/10 border border-[var(--accent-jade)]/20 flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--accent-gold)] uppercase tracking-wider mb-1">Integration</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Zikit + OpenClaw</h1>
          </div>
        </div>

        <p className="text-[var(--text-sage)] text-lg mb-10 leading-relaxed">
          Connect Zikit to <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-jade)] hover:underline">OpenClaw</a> and get website change alerts directly in Telegram, WhatsApp, Discord, or any messaging app. Ask questions about your monitors in natural language.
        </p>

        {/* What you can do */}
        <div className="card-glass rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold mb-5">What you can do</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "💬", title: "Ask about changes", desc: "\"What changed on competitor.com today?\"" },
              { icon: "📊", title: "Get summaries", desc: "\"Show me important changes this week\"" },
              { icon: "➕", title: "Add monitors", desc: "\"Monitor https://example.com/pricing\"" },
              { icon: "🔔", title: "Proactive alerts", desc: "Get notified in Telegram when something changes" },
              { icon: "⚡", title: "Trigger checks", desc: "\"Check the competitor page now\"" },
              { icon: "⏸️", title: "Manage monitors", desc: "\"Pause the ynet monitor\"" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                <span className="text-lg mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-medium text-sm text-[var(--text-cream)]">{f.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 italic">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup steps */}
        <div className="card-glass rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold mb-5">Setup in 3 minutes</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-[var(--accent-jade)]/15 text-[var(--accent-jade)] flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <div>
                <p className="font-semibold text-[var(--text-cream)]">Get your API key</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Go to <Link href="/dashboard/settings" className="text-[var(--accent-jade)] hover:underline">Settings</Link> in your Zikit dashboard and generate an API key. Requires a Business plan.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-[var(--accent-jade)]/15 text-[var(--accent-jade)] flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <div>
                <p className="font-semibold text-[var(--text-cream)]">Install the Zikit skill</p>
                <p className="text-sm text-[var(--text-muted)] mt-1 mb-3">
                  Download the skill file and place it in your OpenClaw skills directory:
                </p>
                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-[var(--text-sage)] overflow-x-auto">
                  <p className="text-[var(--text-muted)]"># Download the skill</p>
                  <p>mkdir -p ~/.openclaw/skills/zikit</p>
                  <p>curl -sL {SKILL_RAW_URL} \</p>
                  <p>  -o ~/.openclaw/skills/zikit/SKILL.md</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={SKILL_RAW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs !py-1.5 !px-3 inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Download SKILL.md
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-[var(--accent-jade)]/15 text-[var(--accent-jade)] flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <div>
                <p className="font-semibold text-[var(--text-cream)]">Connect in Telegram</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Open your OpenClaw chat and tell it your API key. Then start asking about your monitors:
                </p>
                <div className="bg-black/30 rounded-lg p-3 mt-3 space-y-2">
                  <p className="text-xs"><span className="text-[var(--text-muted)]">You:</span> <span className="text-[var(--text-cream)]">Set my Zikit API key to zk_live_xxxxx</span></p>
                  <p className="text-xs"><span className="text-[var(--text-muted)]">You:</span> <span className="text-[var(--text-cream)]">What changed on my monitors today?</span></p>
                  <p className="text-xs"><span className="text-[var(--accent-jade)]">Claw:</span> <span className="text-[var(--text-sage)]">3 changes found. competitor.com dropped Pro pricing from $49 to $39...</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card-glass rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Requirements</h2>
          <ul className="space-y-2">
            {[
              "Zikit Business plan (for API key access)",
              "OpenClaw installed on your device",
              "A messaging app connected to OpenClaw (Telegram, WhatsApp, Discord, etc.)",
            ].map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-[var(--text-sage)]">
                <svg className="w-4 h-4 text-[var(--accent-jade)] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/signup" className="btn-primary text-base">Get started with Zikit</Link>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            Don't have OpenClaw? <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-jade)] hover:underline">Get it free</a>
          </p>
        </div>

      </div>
      <SiteFooter />
    </main>
  );
}
