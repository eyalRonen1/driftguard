import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Blog - Website Monitoring Insights",
  description: "Learn about website change monitoring, competitor tracking, AI-powered alerts, and how to stay ahead with Zikit.",
};

const POSTS = [
  {
    slug: "what-is-website-change-monitoring",
    title: "What is Website Change Monitoring and Why Your Business Needs It",
    excerpt: "The complete guide to tracking changes on any webpage - and turning them into actionable insights with AI.",
    image: "/assets/blog-what-is-hero.webp",
    date: "April 4, 2026",
    tag: "Guide",
  },
  {
    slug: "how-to-monitor-website-changes",
    title: "How to Monitor Any Website for Changes in 5 Minutes",
    excerpt: "Step-by-step tutorial from zero to your first alert. Set up monitors, keywords, and notifications.",
    image: "/assets/blog-howto-hero.webp",
    date: "April 4, 2026",
    tag: "Tutorial",
  },
  {
    slug: "5-ways-teams-use-website-monitoring",
    title: "5 Ways Teams Use Website Monitoring to Stay Ahead",
    excerpt: "Real use cases from competitor pricing intelligence to regulatory compliance and SEO protection.",
    image: "/assets/blog-usecases-hero.webp",
    date: "April 4, 2026",
    tag: "Use Cases",
  },
  {
    slug: "chrome-extension-website-monitoring",
    title: "How to Use a Chrome Extension to Monitor Any Website",
    excerpt: "One-click monitoring, visual CSS picker, badge alerts, and keyboard shortcuts. The fastest way to track changes.",
    image: "/assets/blog-extension-hero.webp",
    date: "April 4, 2026",
    tag: "Extension",
  },
  {
    slug: "ai-chat-assistant-for-website-changes",
    title: "Meet Camo: The AI Chat Assistant That Explains Website Changes",
    excerpt: "Not just alerts - a conversation. Ask Camo what changed, why it matters, and what to do about it.",
    image: "/assets/blog-aichat-hero.webp",
    date: "April 4, 2026",
    tag: "AI",
  },
  {
    slug: "api-integrations-telegram-slack-webhooks",
    title: "API and Integrations: Telegram, Slack, Discord, Webhooks",
    excerpt: "Connect Zikit to your workflow. REST API, Telegram bots, Slack alerts, and custom webhooks.",
    image: "/assets/blog-api-hero.webp",
    date: "April 4, 2026",
    tag: "Integrations",
  },
  {
    slug: "keyword-monitoring-css-selectors",
    title: "Keyword Monitoring and CSS Selectors: Track Exactly What Matters",
    excerpt: "Stop the noise. Use keywords and CSS selectors to get alerted only when the things you care about change.",
    image: "/assets/blog-keywords-hero.webp",
    date: "April 4, 2026",
    tag: "Advanced",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-jungle-stage text-[var(--text-cream)]">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <Image src="/assets/pat-chameleon.webp" alt="" fill className="object-cover" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/"><Image src="/assets/zikit-nav-logo.webp" alt="Zikit" width={150} height={50} className="h-10 w-auto" /></Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-sage)] hover:text-[var(--text-cream)] transition hidden sm:block">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm !py-1.5 !px-4">Get started</Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex justify-center mb-4">
            <Image src="/assets/page-blog-1.webp" alt="Camo writing" width={80} height={80} className="rounded-xl" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Blog</h1>
          <p className="text-[var(--text-sage)] text-lg max-w-md mx-auto">
            Insights on website monitoring, competitor tracking, and AI-powered change detection.
          </p>
        </div>

        {/* Featured post */}
        <Link href={`/blog/${POSTS[0].slug}`} className="block mb-8 group">
          <div className="card-glass card-lift rounded-2xl overflow-hidden">
            <div className="aspect-[2/1] relative">
              <Image src={POSTS[0].image} alt={POSTS[0].title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-wider bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded-full">{POSTS[0].tag}</span>
                  <span className="text-xs text-white/60">{POSTS[0].date}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[var(--accent-jade)] transition">{POSTS[0].title}</h2>
                <p className="text-sm text-white/70 hidden sm:block">{POSTS[0].excerpt}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* More posts grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {POSTS.slice(1).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <div className="card-glass card-lift rounded-2xl overflow-hidden h-full">
                <div className="aspect-[16/9] relative">
                  <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-wider bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">{post.tag}</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-[var(--text-muted)] mb-2">{post.date}</p>
                  <h3 className="font-bold text-lg text-[var(--text-cream)] mb-2 group-hover:text-[var(--accent-jade)] transition leading-snug">{post.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
