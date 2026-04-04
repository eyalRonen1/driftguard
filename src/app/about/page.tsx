import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "About Zikit",
  description: "Zikit is an AI-powered website change monitoring tool. Know the moment anything changes on the pages that matter to your business.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-jungle-stage text-[var(--text-cream)]">
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/"><Image src="/assets/zikit-nav-logo.webp" alt="Zikit" width={150} height={50} className="h-10 w-auto" /></Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-sage)] hover:text-[var(--text-cream)] transition hidden sm:block">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm !py-1.5 !px-4">Get started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl"><Image src="/assets/page-about-1.webp" alt="Camo monitoring" width={512} height={512} className="w-full" /></div>
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl hidden sm:block"><Image src="/assets/page-about-2.webp" alt="Camo watching" width={512} height={512} className="w-full" /></div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold mb-6">About Zikit</h1>
        <div className="space-y-6 text-[var(--text-sage)] text-lg leading-relaxed">
          <p>Zikit is an AI-powered website change monitoring tool that watches any webpage for you and delivers clear, plain-English summaries of exactly what changed and why it matters.</p>
          <p>No more manual checking. No more noisy raw diffs. Just smart alerts and instant insights.</p>
          <p>We built Zikit for busy teams and businesses that need to stay on top of competitors pricing, regulatory updates, supplier changes, job postings, documentation, and anything else that lives on the web.</p>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mt-14 mb-4">Why Zikit</h2>
        <p className="text-[var(--text-sage)] text-lg leading-relaxed">In Hebrew, Zikit means chameleon - a creature that instantly detects changes in its environment and adapts. That is exactly what our mascot Camo does: it quietly monitors your pages, spots every meaningful change, filters out the noise, and tells you what is actually important.</p>

        <h2 className="text-2xl sm:text-3xl font-bold mt-14 mb-6">What you get with Zikit</h2>
        <div className="space-y-4">
          {[
            { title: "Chrome Extension", desc: "Monitor any element with one click and a smart CSS picker." },
            { title: "Built-in AI Chat", desc: "Ask questions about the changes Camo found and get instant business insights." },
            { title: "Smart AI summaries", desc: "Clear explanations instead of raw code diffs." },
            { title: "Flexible alerts", desc: "Slack, Discord, Telegram, email, or webhooks." },
            { title: "Fast checks", desc: "As frequent as every 15 minutes." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--accent-jade)] mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              <p className="text-[var(--text-sage)] text-lg"><strong className="text-[var(--text-cream)]">{item.title}</strong> - {item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[var(--text-muted)] mt-6">All plans include the AI Chat and Chrome Extension. No credit card required to start. Cancel anytime.</p>

        <h2 className="text-2xl sm:text-3xl font-bold mt-14 mb-4">Our vision</h2>
        <p className="text-[var(--text-sage)] text-lg leading-relaxed">Make it effortless for every business to know when something important changes - before their competitors do.</p>

        <div className="mt-14 card-glass rounded-2xl p-8 text-center">
          <p className="text-xl font-semibold text-[var(--text-cream)] mb-2">Ready to stop refreshing pages manually?</p>
          <p className="text-[var(--text-sage)] mb-6">Let Camo watch for you.</p>
          <Link href="/" className="btn-primary text-base">Back to home</Link>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
