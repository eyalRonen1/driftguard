import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BlogRelated } from "@/components/shared/blog-related";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "How to Use a Chrome Extension to Monitor Any Website for Changes",
  description: "Install the Zikit Chrome Extension and start monitoring any webpage with one click. Visual CSS picker, badge alerts, and keyboard shortcuts.",
  alternates: { canonical: "https://zikit.ai/blog/chrome-extension-website-monitoring" },
  openGraph: { title: "How to Use a Chrome Extension to Monitor Any Website", description: "One-click monitoring with visual CSS picker.", images: [{ url: "/assets/blog-extension-hero-og.jpg", width: 1200, height: 630, alt: "How to Use a Chrome Extension to Monitor Any Website" }] },
  keywords: "website monitoring chrome extension, monitor website changes chrome, browser extension website tracker",
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: "How to Use a Chrome Extension to Monitor Any Website", description: "One-click monitoring with visual CSS picker and badge alerts.", image: "https://zikit.ai/assets/blog-extension-hero.webp", datePublished: "2026-04-04", author: { "@type": "Organization", name: "Zikit" }, publisher: { "@type": "Organization", name: "Zikit", logo: { "@type": "ImageObject", url: "https://zikit.ai/assets/zikit-nav-logo.webp" } } }) }} />
      <article className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-jade)] transition inline-flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Back to blog
        </Link>

        <div className="mb-8">
          <time dateTime="2026-04-04" className="text-sm text-[var(--accent-gold)] mb-2 block">April 4, 2026</time>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">How to Use a Chrome Extension to Monitor Any Website for Changes</h1>
          <p className="text-[var(--text-sage)] text-lg">One click. Any page. Instant monitoring.</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-10">
          <Image src="/assets/blog-extension-hero.webp" alt="Camo browsing with the extension" width={896} height={512} className="w-full" />
        </div>

        <div className="prose-dark space-y-6 text-[var(--text-sage)] text-base leading-relaxed">
          <p>You're browsing a competitor's website and notice their pricing page. You think: "I should track this." But by the time you open another tab, log into a monitoring tool, and copy-paste the URL, the moment is gone. You forget.</p>
          <p>That's why we built the Zikit Chrome Extension. See a page worth watching? Click the icon. Done.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">What the extension does</h2>
          <p>The Zikit Chrome Extension adds a small chameleon icon to your browser toolbar. When you're on any webpage, clicking it lets you:</p>

          <div className="space-y-3 my-6">
            {[
              { title: "One-click monitoring", desc: "The current page URL and title are pre-filled. Just click 'Monitor' and you're done. No copy-pasting, no tab switching." },
              { title: "Visual CSS selector picker", desc: "Don't want to monitor the whole page? Click 'Pick element' and hover over the page. Click the section you care about - the pricing table, the job listing, the specific paragraph. Camo will only watch that element." },
              { title: "Badge notifications", desc: "When changes are detected on your monitored pages, a number appears on the extension icon. Click to see what changed." },
              { title: "Keyboard shortcut", desc: "Press Alt+M (or Option+M on Mac) to instantly open the monitoring popup on any page. No mouse needed." },
            ].map((f) => (
              <div key={f.title} className="card-glass rounded-xl p-4">
                <h3 className="font-semibold text-[var(--text-cream)] mb-1">{f.title}</h3>
                <p className="text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">The CSS selector picker - your secret weapon</h2>
          <p>This is the feature that makes the extension truly powerful. Most monitoring tools watch the entire page, which means you get alerted for every tiny change - ads rotating, timestamps updating, cookie banners appearing. Noise.</p>
          <p>With the CSS selector picker, you point at exactly what matters. Want to track only the pricing table? Click it. Only the "About Us" section? Click it. Only the job listings? Click them.</p>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl my-10">
            <Image src="/assets/blog-extension-inline.webp" alt="CSS selector targeting a pricing table" width={896} height={512} className="w-full" />
          </div>

          <p>Camo generates the CSS selector automatically. You don't need to know any code. The selected element is highlighted with a green border so you can see exactly what you're monitoring.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Real workflow example</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>You're reading a competitor's blog post about their new feature</li>
            <li>You press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Alt+M</kbd></li>
            <li>The extension popup opens with the URL pre-filled</li>
            <li>You select "Competitor" as use case, set frequency to "Daily"</li>
            <li>Click "Monitor" - done. 5 seconds.</li>
            <li>Tomorrow, if they update the post, you get an AI summary in your inbox</li>
          </ol>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">How to install</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to the Chrome Web Store and search "Zikit" (or click the link in your dashboard)</li>
            <li>Click "Add to Chrome"</li>
            <li>The extension auto-connects to your Zikit account - no manual API key needed</li>
            <li>Start browsing and click the chameleon icon whenever you see a page worth watching</li>
          </ol>

          <p>The extension is included free with all Zikit plans.</p>

          <div className="card-glass rounded-2xl p-6 text-center mt-10">
            <p className="text-lg font-semibold text-[var(--text-cream)] mb-2">Get the extension</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">Free with every Zikit account. No extra cost.</p>
            <Link href="/signup" className="btn-primary text-base">Sign up and install</Link>
          </div>
        </div>
      </article>

      <div className="max-w-3xl mx-auto px-6 pb-10"><BlogRelated currentSlug="chrome-extension-website-monitoring" /></div>
      <SiteFooter />
    </main>
  );
}
