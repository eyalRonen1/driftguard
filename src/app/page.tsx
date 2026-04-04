import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CamoStripes, CamoEye, CamoPaw } from "@/components/brand/camo";
import { FloatingLeaves } from "@/components/marketing/floating-leaves";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/animate-in";
import { UrlDemo } from "@/components/marketing/url-demo";

export const metadata: Metadata = {
  title: "Zikit - Website Change Monitoring with AI Summaries",
  description:
    "Monitor any web page for changes and get AI-powered summaries of what changed. Not raw diffs  - plain English insights like 'Competitor dropped prices by 15%.'",
  keywords: "website monitoring, page change detection, competitor tracking, AI summaries, web alerts, price monitoring, compliance monitoring",
  alternates: { canonical: "https://zikit.ai" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Zikit - Know when any webpage changes",
    description: "AI-powered website change monitoring. Get plain-English summaries, not raw diffs.",
    url: "https://zikit.ai",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630, alt: "Zikit - AI-powered website change monitoring" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zikit - Know when any webpage changes",
    description: "AI-powered website change monitoring. Get plain-English summaries, not raw diffs.",
    images: ["/assets/og-image.png"],
  },
};

export default function LandingPage() {
  return (
    <main className="bg-jungle-stage text-[var(--text-cream)]">
      <div className="canopy-vignette" />
      <div className="gold-shaft" />
      <FloatingLeaves />

      {/* Nav */}
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

      {/* Hero */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <Image src="/assets/pat-eye.webp" alt="" fill className="object-cover" />
        </div>
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-6 text-center relative z-10">
          <AnimateIn>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Any page changes.
              <br />
              <span className="text-[var(--accent-jade)]">Camo catches it.</span>
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <p className="text-[var(--text-sage)] mt-5 text-lg sm:text-xl font-light max-w-md mx-auto">
              Monitor any webpage and get AI-powered summaries of what changed - so you don&apos;t have to keep checking.
            </p>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link href="/signup" className="btn-primary text-base">Start free</Link>
              <a href="#how" className="btn-secondary text-base">How it works</a>
            </div>

            <p className="text-[var(--text-dim)] text-sm mt-3">No credit card required</p>
          </AnimateIn>

          {/* Hero animation - Camo catches a change! */}
          <AnimateIn delay={0.4}>
            <div className="mt-10 max-w-xl mx-auto rounded-2xl overflow-hidden border border-white/10 ring-1 ring-[var(--accent-jade)]/10 shadow-2xl shadow-black/40">
              <img src="/assets/hero-camo-video.gif" alt="Camo detecting a website change" className="w-full" loading="eager" />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 relative z-10 trust-strip">
        <div className="max-w-7xl mx-auto px-6">
          <AnimateIn delay={0.5}>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-12 text-[var(--text-sage)] text-sm tracking-wide">
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>AI summaries, not raw diffs</span>
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>Built-in AI chat assistant</span>
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>Smart noise filtering</span>
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>Checks up to every 15 min</span>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Live Demo */}
      <section className="pb-10 sm:pb-16 -mt-6 relative z-10">
        <div className="max-w-xl sm:max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateIn delay={0.5}>
            <div className="card-glass rounded-2xl p-5 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]">
                <Image src="/assets/pat-chameleon.webp" alt="" fill className="object-cover" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-5">
                  <Image src="/assets/camo-watch.webp" alt="Camo watching your page" width={40} height={40} className="rounded-lg" />
                  <div>
                    <p className="text-xs font-medium text-[var(--accent-gold)] tracking-wider uppercase">Live demo</p>
                    <h2 className="text-lg sm:text-xl font-bold">Can Camo watch your page?</h2>
                  </div>
                </div>
                <UrlDemo />
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* How */}
      <section id="how" className="section-band py-20 relative">
        <div className="section-line-top" />
        <div className="section-line-bottom" />
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex justify-center mb-3"><CamoPaw size={20} /></div>
          <p className="text-center text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">How it works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-14">Three steps. Zero effort.</h2>
          <StaggerContainer className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Feed Camo a URL", d: "Paste any URL. Tracking starts instantly.", img: "/assets/step1-eat-url.webp", video: null, pat: "/assets/pat-eye.webp" },
              { n: "2", t: "Camo watches", d: "Scheduled checks catch every change.", img: "/assets/step2-scan.webp", video: null, pat: "/assets/pat-chameleon.webp" },
              { n: "3", t: "Camo rings the bell!", d: "AI summary hits your inbox or Slack.", img: "/assets/step3-bell.webp", video: null, pat: "/assets/pat-swirl.webp" },
            ].map((s, i) => (
              <StaggerItem key={i} className="card-glass card-lift p-7 sm:p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]">
                  <Image src={s.pat} alt="" fill className="object-cover" />
                </div>
                <div className="relative z-10">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent-jade)]/15 text-[var(--accent-jade)] text-xs font-bold mb-3">{s.n}</span>
                {s.video ? (
                  <div className="mx-auto mb-3 rounded-xl overflow-hidden w-[140px] h-[140px]">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover" poster={s.img}>
                      <source src={s.video} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <Image src={s.img} alt={s.t} width={140} height={140} className="mx-auto mb-3 rounded-xl" />
                )}
                <h3 className="font-semibold text-lg tracking-tight">{s.t}</h3>
                <p className="text-base text-[var(--text-sage)] mt-2 leading-relaxed">{s.d}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ========== Chrome Extension ========== */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <Image src="/assets/pat-eye.webp" alt="" fill className="object-cover" />
        </div>
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-6 relative z-10 text-center">
          <AnimateIn>
            <p className="text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">Chrome Extension</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Monitor any page in&nbsp;one&nbsp;click</h2>
            <p className="text-[var(--text-sage)] text-lg mb-10 max-w-lg mx-auto">
              See a page worth watching? Click the Zikit icon. Done.
            </p>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg sm:max-w-2xl mx-auto mb-12">
              {[
                { icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" /></svg>, t: "One click", d: "Instant tracking" },
                { icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5" /></svg>, t: "CSS picker", d: "Select any element" },
                { icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>, t: "Badge alerts", d: "Change count" },
              ].map((f) => (
                <div key={f.t} className="card-glass rounded-xl p-5 sm:p-6">
                  <div className="w-14 h-14 rounded-xl bg-[var(--accent-jade)]/10 flex items-center justify-center mx-auto mb-3 text-[var(--accent-jade)]">{f.icon}</div>
                  <p className="font-semibold text-base text-[var(--text-cream)]">{f.t}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{f.d}</p>
                </div>
              ))}
            </div>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <a href="https://chromewebstore.google.com" target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2 text-base">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001-3.95 6.841A12.004 12.004 0 0 0 24 12c0-.746-.068-1.477-.199-2.182z"/></svg>
              Add to Chrome  - Free
            </a>
          </AnimateIn>
        </div>
      </section>

      {/* ========== AI Chat Assistant ========== */}
      <section className="section-band py-20 relative overflow-hidden">
        <div className="section-line-top" />
        <div className="section-line-bottom" />
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left  - visual */}
            <AnimateIn>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
                  <Image src="/assets/section-ai-chat.webp" alt="Zikit AI Chat Assistant" width={896} height={512} className="w-full" />
                </div>
              </div>
            </AnimateIn>
            {/* Right  - text */}
            <AnimateIn delay={0.2}>
              <div className="flex justify-start mb-3"><CamoEye size={20} /></div>
              <p className="text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">AI Chat Assistant</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Ask Camo about your&nbsp;changes</h2>
              <p className="text-[var(--text-sage)] text-lg mb-8 leading-relaxed">
                Not just alerts - a conversation. Ask Camo what changed, why it matters, and what to do about it.
              </p>
              {/* Fake chat conversation mockup */}
              <div className="card-glass rounded-2xl p-5 space-y-3 mb-8">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs">👤</div>
                  <div className="bg-white/5 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-cream)]">
                    What changed on the competitor pricing page?
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Image src="/assets/camo-happy.webp" alt="Camo" width={28} height={28} className="rounded-full flex-shrink-0" />
                  <div className="bg-[var(--accent-jade)]/10 border border-[var(--accent-jade)]/20 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-sage)]">
                    The Pro plan price dropped from <strong className="text-[var(--accent-gold)]">$49 to $39</strong> and they added a new Enterprise tier at $99/mo. This is the first price change in 3&nbsp;months.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs">👤</div>
                  <div className="bg-white/5 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-cream)]">
                    Should I update our pricing too?
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Image src="/assets/camo-happy.webp" alt="Camo" width={28} height={28} className="rounded-full flex-shrink-0" />
                  <div className="bg-[var(--accent-jade)]/10 border border-[var(--accent-jade)]/20 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[var(--text-sage)]">
                    Their Pro is now <strong className="text-[var(--accent-jade)]">22% cheaper</strong> than yours. Consider adjusting or highlighting extra value. I can set up a monitor on their Enterprise page too.
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] italic mb-1">Available on all plans.</p>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ========== Notification Channels ========== */}
      <section className="section-band py-20 relative">
        <div className="section-line-top" />
        <div className="section-line-bottom" />
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 relative z-10 text-center">
          <AnimateIn>
            <div className="flex justify-center mb-3"><CamoPaw size={18} /></div>
            <p className="text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">Alerts your way</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Get notified everywhere</h2>
            <p className="text-[var(--text-sage)] text-lg mb-14 max-w-lg mx-auto">Choose how you hear about changes. Mix and match per monitor - one can ping Slack, another emails your team.</p>
          </AnimateIn>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-10">
            {[
              { name: "Email", img: "/assets/ch-email-v2.webp", desc: "Instant inbox alerts", plan: "All plans" },
              { name: "Slack", img: "/assets/ch-slack-v2.webp", desc: "Channel notifications", plan: "Pro" },
              { name: "Discord", img: "/assets/ch-discord-v2.webp", desc: "Server webhooks", plan: "Pro" },
              { name: "Telegram", img: "/assets/ch-telegram-v2.webp", desc: "Bot messages", plan: "Pro" },
              { name: "Webhooks", img: "/assets/ch-webhook-v2.webp", desc: "Custom integrations", plan: "Business" },
            ].map((ch) => (
              <StaggerItem key={ch.name} className="text-center">
                <Image src={ch.img} alt={ch.name} width={150} height={150} className="mx-auto mb-4 rounded-2xl" />
                <p className="font-bold text-lg text-[var(--text-cream)] mb-1">{ch.name}</p>
                <p className="text-sm text-[var(--text-muted)] mb-2">{ch.desc}</p>
                <span className="text-xs font-medium text-[var(--accent-jade)] uppercase tracking-wider">{ch.plan}</span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 relative">
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex justify-center mb-3"><CamoEye size={22} /></div>
          <p className="text-center text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">Use cases</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-14">What teams watch</h2>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { t: "Competitor pricing", d: "Spot price changes instantly.", img: "/assets/uc-big-pricing.webp" },
              { t: "Regulations", d: "Never miss a policy update.", img: "/assets/uc-big-legal.webp" },
              { t: "Supplier costs", d: "Track cost shifts in real time.", img: "/assets/uc-big-shopping.webp" },
              { t: "Job postings", d: "See who competitors are hiring.", img: "/assets/uc-big-jobs.webp" },
              { t: "Documentation", d: "Know when APIs change their docs.", img: "/assets/uc-big-docs.webp" },
              { t: "SEO changes", d: "Catch meta and content edits.", img: "/assets/uc-big-seo.webp" },
            ].map((u, i) => (
              <StaggerItem key={i} className="card-glass card-lift overflow-hidden rounded-2xl">
                <div className="aspect-[16/10] relative">
                  <Image src={u.img} alt={u.t} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="font-bold text-xl text-white drop-shadow-lg">{u.t}</h3>
                    <p className="text-base text-white/75 mt-0.5">{u.d}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-band py-20 relative">
        <div className="section-line-top" />
        <div className="section-line-bottom" />
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 relative z-10">
          <CamoStripes className="max-w-xs mx-auto mb-4" />
          <p className="text-center text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">Pricing</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-3">Simple and transparent</h2>
          <p className="text-[var(--text-muted)] text-center mb-4 text-base max-w-md mx-auto">Start free, upgrade when you need more. No hidden fees. Cancel anytime.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-jade)] bg-[var(--accent-jade)]/10 px-3 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              AI Chat included on all plans
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-jade)] bg-[var(--accent-jade)]/10 px-3 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Chrome Extension included
            </span>
          </div>
          <StaggerContainer className="grid sm:grid-cols-3 gap-5 items-stretch">
            {[
              { name: "Free", price: "$0", per: "", desc: "For getting started", cta: "Start free", features: ["3 monitors", "Daily checks", "100 checks/mo", "AI summaries", "Email alerts", "7-day history"], pop: false, pattern: "/assets/pat-leaves.webp" },
              { name: "Pro", price: "$19", per: "/mo", desc: "For professionals", cta: "Get Pro", features: ["20 monitors", "Hourly checks", "2,000 checks/mo", "Slack + Email alerts", "CSS selectors", "90-day history"], pop: true, pattern: "/assets/pat-scales.webp" },
              { name: "Business", price: "$49", per: "/mo", desc: "For teams", cta: "Get Business", features: ["100 monitors", "15-min checks", "10,000 checks/mo", "API access", "365-day history", "Custom webhooks", "Priority support", "Export reports"], pop: false, pattern: "/assets/pat-spiral.webp" },
            ].map((p) => (
              <StaggerItem key={p.name} className={`relative overflow-hidden card-lift ${p.pop ? "card-glass-featured p-7 sm:p-8 pricing-featured" : "card-glass p-7 sm:p-8"}`}>
                <div className="absolute inset-0 opacity-[0.06]">
                  <Image src={p.pattern} alt="" fill className="object-cover" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                {p.pop && <span className="text-xs font-bold text-[var(--accent-gold)] uppercase tracking-wider bg-[var(--accent-gold)]/10 px-2.5 py-0.5 rounded-full inline-block">Most popular</span>}
                <h3 className="text-xl font-semibold mt-1">{p.name}</h3>
                <p className="text-base text-muted-foreground">{p.desc}</p>
                <div className="mt-3 mb-5">
                  <span className="text-4xl sm:text-5xl font-bold">{p.price}</span>
                  <span className="text-[var(--text-muted)] text-sm">{p.per}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="text-base text-[var(--text-sage)] flex items-center gap-2">
                      <CamoPaw size={14} />{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <Link href="/signup" className={`block text-center text-base !py-3 ${p.pop ? "btn-primary" : "btn-secondary"}`}>
                    {p.cta}
                  </Link>
                </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <Image src="/assets/pat-camo2.webp" alt="" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(124,203,139,0.03)] to-transparent" />
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-6 text-center relative z-10">
          <Image src="/assets/cta-rocket.webp" alt="Camo launching a rocket" width={150} height={150} className="mx-auto mb-6 rounded-xl" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Ready to launch?</h2>
          <p className="text-[var(--text-sage)] mb-3 text-lg">Set up your first monitor in 30 seconds. No credit card required.</p>
          <p className="text-[var(--text-dim)] mb-8 text-sm">Free plan includes 3 monitors with daily checks and AI summaries.</p>
          <Link href="/signup" className="btn-primary text-lg">Get started free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 py-10 relative z-10">
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="col-span-2">
              <Image src="/assets/zikit-nav-logo.webp" alt="Zikit" width={100} height={33} className="h-7 w-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[240px]">
                AI-powered website change monitoring. Know the moment anything changes on the pages that matter to your business.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Product</p>
              <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
                <Link href="/signup" className="block hover:text-[var(--accent-jade)] transition">Get started</Link>
                <a href="#pricing" className="block hover:text-[var(--accent-jade)] transition">Pricing</a>
                <a href="#how" className="block hover:text-[var(--accent-jade)] transition">How it works</a>
                <a href="https://chromewebstore.google.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[var(--accent-jade)] transition">Chrome Extension</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Resources</p>
              <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
                <Link href="/about" className="block hover:text-[var(--accent-jade)] transition">About</Link>
                <Link href="/docs" className="block hover:text-[var(--accent-jade)] transition">API Docs</Link>
                <Link href="/integrations" className="block hover:text-[var(--accent-jade)] transition">Integrations</Link>
                <Link href="/blog" className="block hover:text-[var(--accent-jade)] transition">Blog</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Legal</p>
              <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
                <Link href="/terms" className="block hover:text-[var(--accent-jade)] transition">Terms</Link>
                <Link href="/privacy" className="block hover:text-[var(--accent-jade)] transition">Privacy</Link>
                <Link href="/refund" className="block hover:text-[var(--accent-jade)] transition">Refunds</Link>
                <Link href="/accessibility" className="block hover:text-[var(--accent-jade)] transition">Accessibility</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Support</p>
              <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
                <a href="mailto:support@zikit.ai" className="block hover:text-[var(--accent-jade)] transition">support@zikit.ai</a>
                <a href="https://x.com/zikit_ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--accent-jade)] transition"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>Follow on X</a>
                <Link href="/login" className="block hover:text-[var(--accent-jade)] transition">Sign in</Link>
                <Link href="/signup" className="block hover:text-[var(--accent-jade)] transition">Sign up</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
            <span>&copy; {new Date().getFullYear()} Zikit. All rights reserved.</span>
            <span>Payments secured by <a href="https://paddle.com" className="text-[var(--accent-jade)] hover:underline">Paddle</a></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
