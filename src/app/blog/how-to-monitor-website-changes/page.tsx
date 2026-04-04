import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BlogRelated } from "@/components/shared/blog-related";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "How to Monitor Any Website for Changes in 5 Minutes",
  description: "Step-by-step guide to setting up website change monitoring with Zikit. Track competitors, regulations, pricing, and more with AI-powered alerts.",
  alternates: { canonical: "https://zikit.ai/blog/how-to-monitor-website-changes" },
  openGraph: { title: "How to Monitor Any Website for Changes in 5 Minutes", description: "Step-by-step tutorial from zero to your first alert.", images: [{ url: "/assets/blog-howto-hero-og.jpg", width: 1200, height: 630, alt: "How to Monitor Any Website for Changes in 5 Minutes" }] },
  keywords: "how to monitor website changes, website change detector, track website updates, monitor webpage changes free",
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: "How to Monitor Any Website for Changes in 5 Minutes", description: "Step-by-step tutorial from zero to your first alert with Zikit.", image: "https://zikit.ai/assets/blog-howto-hero.webp", datePublished: "2026-04-04", author: { "@type": "Organization", name: "Zikit" }, publisher: { "@type": "Organization", name: "Zikit", logo: { "@type": "ImageObject", url: "https://zikit.ai/assets/zikit-nav-logo.webp" } } }) }} />
      <article className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-jade)] transition inline-flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Back to blog
        </Link>

        <div className="mb-8">
          <time dateTime="2026-04-04" className="text-sm text-[var(--accent-gold)] mb-2 block">April 4, 2026</time>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">How to Monitor Any Website for Changes in 5 Minutes</h1>
          <p className="text-[var(--text-sage)] text-lg">A step-by-step tutorial - from zero to your first alert.</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-10">
          <Image src="/assets/blog-howto-hero.webp" alt="Camo setting up monitoring" width={896} height={512} className="w-full" />
        </div>

        <div className="prose-dark space-y-6 text-[var(--text-sage)] text-base leading-relaxed">
          <p>You found a competitor's pricing page you want to watch. Or a government regulation that might change. Or a job board where your dream company posts roles. Whatever it is, you want to know the moment something changes. Here's how to set it up in under 5 minutes.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Step 1: Create your account (30 seconds)</h2>
          <p>Go to <Link href="/signup" className="text-[var(--accent-jade)] hover:underline">zikit.ai/signup</Link> and create a free account. No credit card needed. You get 3 monitors with daily checks immediately.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Step 2: Add your first monitor (60 seconds)</h2>
          <p>Click "Add monitor" and paste the URL you want to watch. Give it a name you'll recognize (like "Competitor Pricing" or "FDA Regulations").</p>

          <p>Choose your settings:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-[var(--text-cream)]">Check frequency</strong> - How often should Camo check? Daily is fine for most pages. Hourly or 15-minute checks are available on paid plans.</li>
            <li><strong className="text-[var(--text-cream)]">Keywords (optional)</strong> - Only get alerted when specific words appear or disappear. Great for tracking specific product names, prices, or terms.</li>
            <li><strong className="text-[var(--text-cream)]">CSS selector (optional)</strong> - Monitor just one section of the page instead of everything. Useful for pricing tables, job listings, or specific articles.</li>
          </ul>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Step 3: Set up your alerts (60 seconds)</h2>
          <p>Choose how you want to be notified when something changes:</p>

          <div className="grid sm:grid-cols-2 gap-3 my-4">
            {[
              { ch: "Email", desc: "Instant alerts to your inbox", plan: "All plans" },
              { ch: "Slack", desc: "Post to any Slack channel", plan: "Pro" },
              { ch: "Discord", desc: "Server webhook notifications", plan: "Pro" },
              { ch: "Telegram", desc: "Bot messages to your chat", plan: "Pro" },
              { ch: "Webhooks", desc: "Custom HTTP POST payloads", plan: "Business" },
            ].map((a) => (
              <div key={a.ch} className="card-glass rounded-lg p-3">
                <p className="font-semibold text-sm text-[var(--text-cream)]">{a.ch}</p>
                <p className="text-xs text-[var(--text-muted)]">{a.desc}</p>
                <p className="text-[10px] text-[var(--accent-jade)] mt-1">{a.plan}</p>
              </div>
            ))}
          </div>

          <p>You can also set a <strong className="text-[var(--text-cream)]">minimum importance level</strong> - so you only get alerted for meaningful changes, not every timestamp update.</p>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl my-10">
            <Image src="/assets/blog-howto-inline.webp" alt="Receiving alerts on multiple devices" width={896} height={512} className="w-full" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Step 4: Wait for changes (or trigger a manual check)</h2>
          <p>Camo will check the page on your chosen schedule. But if you want to see it in action right away, click "Check now" on the monitor detail page. If the page changed since setup, you'll see an AI summary of exactly what's different.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Bonus: Use the Chrome Extension</h2>
          <p>Install the Zikit Chrome Extension and you can start monitoring any page you're browsing with one click. No need to copy-paste URLs. You can even use the visual CSS picker to select exactly which part of the page to watch.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Pro tips</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-[var(--text-cream)]">Use keywords wisely</strong> - Instead of monitoring an entire news site, set keywords like "your company name" to only get alerted when you're mentioned.</li>
            <li><strong className="text-[var(--text-cream)]">Monitor the right page</strong> - Don't monitor a homepage. Monitor the specific pricing page, the specific policy page, the specific job listing.</li>
            <li><strong className="text-[var(--text-cream)]">Set importance thresholds</strong> - "Notable+" filters out trivial changes like date updates and ad rotations.</li>
            <li><strong className="text-[var(--text-cream)]">Tag your monitors</strong> - Use tags like "competitor", "legal", "q2-review" to keep things organized.</li>
          </ul>

          <div className="card-glass rounded-2xl p-6 text-center mt-10">
            <p className="text-lg font-semibold text-[var(--text-cream)] mb-2">Try it now</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">Set up your first monitor in 30 seconds. Free plan available.</p>
            <Link href="/signup" className="btn-primary text-base">Start monitoring</Link>
          </div>
        </div>
      </article>

      <div className="max-w-3xl mx-auto px-6 pb-10"><BlogRelated currentSlug="how-to-monitor-website-changes" /></div>
      <SiteFooter />
    </main>
  );
}
