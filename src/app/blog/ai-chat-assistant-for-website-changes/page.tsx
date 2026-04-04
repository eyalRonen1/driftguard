import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BlogRelated } from "@/components/shared/blog-related";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Meet Camo: The AI Chat Assistant That Explains Website Changes",
  description: "Ask questions about detected changes in plain English. Camo analyzes what changed, why it matters, and what you should do about it.",
  alternates: { canonical: "https://zikit.ai/blog/ai-chat-assistant-for-website-changes" },
  openGraph: { title: "Meet Camo: The AI Chat Assistant That Explains Website Changes", description: "Ask questions about detected changes in plain English.", images: [{ url: "/assets/blog-aichat-hero-og.jpg", width: 1200, height: 630, alt: "Meet Camo: The AI Chat Assistant That Explains Website Changes" }] },
  keywords: "AI chat assistant website changes, AI website monitoring, ask AI about website changes",
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: "Meet Camo: The AI Chat Assistant That Explains Website Changes", description: "Ask questions about detected changes in plain English.", image: "https://zikit.ai/assets/blog-aichat-hero.webp", datePublished: "2026-04-04", author: { "@type": "Organization", name: "Zikit" }, publisher: { "@type": "Organization", name: "Zikit", logo: { "@type": "ImageObject", url: "https://zikit.ai/assets/zikit-nav-logo.webp" } } }) }} />
      <article className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-jade)] transition inline-flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Back to blog
        </Link>

        <div className="mb-8">
          <time dateTime="2026-04-04" className="text-sm text-[var(--accent-gold)] mb-2 block">April 4, 2026</time>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">Meet Camo: The AI Chat Assistant That Explains Website Changes</h1>
          <p className="text-[var(--text-sage)] text-lg">Not just alerts - a conversation about what changed and why it matters.</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl mb-10">
          <Image src="/assets/blog-aichat-hero.webp" alt="Camo AI chat control room" width={896} height={512} className="w-full" />
        </div>

        <div className="prose-dark space-y-6 text-[var(--text-sage)] text-base leading-relaxed">
          <p>Most monitoring tools send you an alert: "Page changed." Maybe they show you a diff. But then what? You still need to figure out what the change means, whether it's important, and what to do about it.</p>
          <p>Camo, Zikit's built-in AI assistant, changes that. Instead of just detecting changes, you can <em>ask questions about them</em>.</p>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">How the AI Chat works</h2>
          <p>Camo lives in the corner of your Zikit dashboard. Click the chameleon icon and start talking. Camo has access to all your monitors and recent changes, so it can answer questions like:</p>

          <div className="card-glass rounded-2xl p-5 space-y-3 my-6">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs">You</div>
              <div className="bg-white/5 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-cream)]">What changed on the competitor pricing page this week?</div>
            </div>
            <div className="flex items-start gap-2.5">
              <Image src="/assets/camo-happy.webp" alt="Camo" width={28} height={28} className="rounded-full flex-shrink-0" />
              <div className="bg-[var(--accent-jade)]/10 border border-[var(--accent-jade)]/20 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-sage)]">
                Two changes detected this week. On Monday, they removed the "Enterprise" plan from the pricing page. On Thursday, they dropped the Pro price from <strong className="text-[var(--accent-gold)]">$49 to $39</strong>. This is a 20% reduction - their first price change in 3 months.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs">You</div>
              <div className="bg-white/5 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-cream)]">Should I adjust our pricing?</div>
            </div>
            <div className="flex items-start gap-2.5">
              <Image src="/assets/camo-happy.webp" alt="Camo" width={28} height={28} className="rounded-full flex-shrink-0" />
              <div className="bg-[var(--accent-jade)]/10 border border-[var(--accent-jade)]/20 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-sage)]">
                Their Pro is now <strong className="text-[var(--accent-jade)]">22% cheaper</strong> than yours at the same tier. You could match the price, or emphasize features they don't have (like AI summaries). Want me to set up a monitor on their features page too?
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">What Camo can do</h2>
          <div className="space-y-3">
            {[
              { title: "Answer questions about changes", desc: "Ask about any monitor - what changed, when, how important it was. Camo knows the full history." },
              { title: "Provide strategic insights", desc: "Camo doesn't just report facts. It analyzes patterns and suggests actions - like a junior analyst who never sleeps." },
              { title: "Take actions", desc: "Ask Camo to create a new monitor, trigger a check, or pause monitoring. It executes directly from the chat." },
              { title: "Explain in plain English", desc: "No technical jargon. Camo translates code diffs into business language anyone can understand." },
            ].map((f) => (
              <div key={f.title} className="card-glass rounded-xl p-4">
                <h3 className="font-semibold text-[var(--text-cream)] mb-1">{f.title}</h3>
                <p className="text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl my-10">
            <Image src="/assets/blog-aichat-inline.webp" alt="Camo analyzing changes" width={896} height={512} className="w-full" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Questions you can ask</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>"What changed on [monitor name] today?"</li>
            <li>"Show me the most important changes this week"</li>
            <li>"Did anyone update their pricing recently?"</li>
            <li>"How many monitors do I have?"</li>
            <li>"Create a monitor for https://example.com/pricing"</li>
            <li>"What should I do about the latest change?"</li>
          </ul>

          <h2 className="text-2xl font-bold text-[var(--text-cream)] mt-10 mb-4">Available on all plans</h2>
          <p>Camo AI Chat is included free with every Zikit plan - including the free tier. There's no extra cost, no per-message pricing, no token limits. Just open the chat and ask.</p>

          <div className="card-glass rounded-2xl p-6 text-center mt-10">
            <p className="text-lg font-semibold text-[var(--text-cream)] mb-2">Try asking Camo</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">Sign up free and start a conversation.</p>
            <Link href="/signup" className="btn-primary text-base">Meet Camo</Link>
          </div>
        </div>
      </article>

      <div className="max-w-3xl mx-auto px-6 pb-10"><BlogRelated currentSlug="ai-chat-assistant-for-website-changes" /></div>
      <SiteFooter />
    </main>
  );
}
