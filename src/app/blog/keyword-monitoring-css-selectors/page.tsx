import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BlogRelated } from "@/components/shared/blog-related";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Keyword Monitoring and CSS Selectors: Track Exactly What Matters",
  description: "Learn how to use keyword alerts and CSS selector targeting to monitor specific page elements and get alerted only when it matters.",
  alternates: { canonical: "https://zikit.ai/blog/keyword-monitoring-css-selectors" },
  openGraph: { title: "Keyword Monitoring and CSS Selectors: Track Exactly What Matters", description: "Stop the noise with precision targeting.", images: [{ url: "/assets/blog-keywords-hero-og.jpg", width: 1200, height: 630, alt: "Keyword Monitoring and CSS Selectors: Track Exactly What Matters" }] },
  keywords: "keyword monitoring website, CSS selector monitoring, track specific page element changes, website keyword tracker",
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: "Keyword Monitoring and CSS Selectors: Track Exactly What Matters", description: "Use keywords and CSS selectors to get alerted only when it matters.", image: "https://zikit.ai/assets/blog-keywords-hero.webp", datePublished: "2026-04-04", author: { "@type": "Organization", name: "Zikit" }, publisher: { "@type": "Organization", name: "Zikit", logo: { "@type": "ImageObject", url: "https://zikit.ai/assets/zikit-nav-logo.webp" } } }) }} />
      <article className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-jade)] transition inline-flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Back to blog
        </Link>

        <div className="mb-8">
          <time dateTime="2026-04-04" className="text-sm text-[var(--accent-gold)] mb-2 block">April 4, 2026</time>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">Keyword Monitoring and CSS Selectors: Track Exactly What Matters</h1>
          <p className="text-[var(--text-sage)] text-lg">Stop the noise. Get alerted only when the things you care about change.</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-10">
          <Image src="/assets/blog-keywords-hero.webp" alt="Camo targeting specific keywords" width={896} height={512} className="w-full" />
        </div>

        <div className="prose-dark space-y-6 text-[var(--text-sage)] text-base leading-relaxed">
          <p>The biggest complaint about website monitoring? Too many alerts. A timestamp changes, an ad rotates, a cookie banner updates - and you get pinged for all of it. After a week, you start ignoring alerts. After a month, you turn them off.</p>
          <p>Zikit solves this with two precision tools: <strong className="text-[var(--text-cream)]">keyword monitoring</strong> and <strong className="text-[var(--text-cream)]">CSS selectors</strong>. Together, they let you define exactly what you care about - and ignore everything else.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Keyword monitoring</h2>
          <p>Set specific words or phrases to watch for. Zikit will only alert you when those keywords appear, disappear, or change on the page.</p>

          <h3 className="text-lg font-semibold text-[var(--text-cream)] mt-6 mb-3">Three keyword modes</h3>
          <div className="space-y-3">
            <div className="card-glass rounded-xl p-4">
              <h4 className="font-semibold text-[var(--text-cream)] mb-1">Any change (default)</h4>
              <p className="text-sm">Alert when the count of your keyword on the page changes. If "free shipping" appears 3 times and drops to 2, you'll know.</p>
            </div>
            <div className="card-glass rounded-xl p-4">
              <h4 className="font-semibold text-[var(--text-cream)] mb-1">Appear</h4>
              <p className="text-sm">Alert only when a keyword is <em>added</em> to the page. Great for tracking when a competitor adds a new feature or product.</p>
            </div>
            <div className="card-glass rounded-xl p-4">
              <h4 className="font-semibold text-[var(--text-cream)] mb-1">Disappear</h4>
              <p className="text-sm">Alert when a keyword is <em>removed</em>. Catch when "money-back guarantee" disappears from a terms page.</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-[var(--text-cream)] mt-6 mb-3">Real examples</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-[var(--text-cream)]">E-commerce:</strong> Keywords "sale", "discount", "free shipping" on competitor pages</li>
            <li><strong className="text-[var(--text-cream)]">Legal:</strong> Keywords "effective date", "amended", "new requirement" on regulation pages</li>
            <li><strong className="text-[var(--text-cream)]">HR:</strong> Your company name on job review sites like Glassdoor</li>
            <li><strong className="text-[var(--text-cream)]">SEO:</strong> Your brand name on competitor comparison pages</li>
          </ul>

          <p className="mt-4"><strong className="text-[var(--accent-jade)]">Bonus:</strong> When keywords match, Zikit automatically boosts the importance score to 6+, ensuring you always get alerted - regardless of your minimum importance setting.</p>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl my-10">
            <Image src="/assets/blog-keywords-inline.webp" alt="Camo filtering keywords" width={896} height={512} className="w-full" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">CSS selectors</h2>
          <p>CSS selectors let you monitor a <em>specific part</em> of a page instead of the whole thing. Think of it as zooming in on what matters.</p>

          <h3 className="text-lg font-semibold text-[var(--text-cream)] mt-6 mb-3">Why use CSS selectors?</h3>
          <p>A typical webpage has navigation, footer, sidebar, ads, cookie banners, and the actual content. Without a CSS selector, Zikit monitors everything - and changes to navigation or ads trigger false alerts.</p>
          <p>With a CSS selector like <code className="text-[var(--accent-jade)] bg-black/20 px-1.5 py-0.5 rounded text-xs font-mono">#pricing-table</code>, Zikit only watches the pricing table. Everything else is ignored.</p>

          <h3 className="text-lg font-semibold text-[var(--text-cream)] mt-6 mb-3">How to set CSS selectors</h3>
          <p>Two ways:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong className="text-[var(--text-cream)]">Chrome Extension (easy)</strong> - Click "Pick element" and visually select the section you want. Camo generates the selector automatically. No coding needed.</li>
            <li><strong className="text-[var(--text-cream)]">Manual (advanced)</strong> - Type a CSS selector when creating or editing a monitor. Supports IDs, classes, and complex selectors like <code className="text-[var(--accent-jade)] bg-black/20 px-1 rounded text-xs font-mono">.pricing-section .plan-card</code>.</li>
          </ol>

          <h3 className="text-lg font-semibold text-[var(--text-cream)] mt-6 mb-3">Ignore selectors</h3>
          <p>The opposite of CSS selectors. Instead of saying "watch this", you say "ignore this". Add selectors like <code className="text-[var(--accent-jade)] bg-black/20 px-1.5 py-0.5 rounded text-xs font-mono">.ads, .timestamp, .cookie-banner</code> to filter out known noisy elements while watching the rest of the page.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Combining both for precision</h2>
          <p>The ultimate setup: CSS selector to focus on the right section + keywords to alert on the right content. Example:</p>
          <div className="card-glass rounded-lg p-4 my-4 border-l-2 border-[var(--accent-jade)]">
            <p className="text-sm"><strong className="text-[var(--text-cream)]">Monitor:</strong> competitor.com/pricing</p>
            <p className="text-sm"><strong className="text-[var(--text-cream)]">CSS selector:</strong> .pricing-plans</p>
            <p className="text-sm"><strong className="text-[var(--text-cream)]">Keywords:</strong> $, /mo, enterprise, free</p>
            <p className="text-sm"><strong className="text-[var(--text-cream)]">Result:</strong> Alert only when pricing numbers or plan names change. Zero noise.</p>
          </div>

          <div className="card-glass rounded-2xl p-6 text-center mt-10">
            <p className="text-lg font-semibold text-[var(--text-cream)] mb-2">Try precision monitoring</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">Keywords available on all plans. CSS selectors on Pro and above.</p>
            <Link href="/signup" className="btn-primary text-base">Start free</Link>
          </div>
        </div>
      </article>

      <div className="max-w-3xl mx-auto px-6 pb-10"><BlogRelated currentSlug="keyword-monitoring-css-selectors" /></div>
      <SiteFooter />
    </main>
  );
}
