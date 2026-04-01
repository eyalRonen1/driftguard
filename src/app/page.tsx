import Link from "next/link";
import Image from "next/image";
import { Camo, CamoStripes, CamoEye, CamoPaw } from "@/components/brand/camo";
import { FloatingLeaves } from "@/components/marketing/floating-leaves";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/animate-in";

export default function LandingPage() {
  return (
    <main className="bg-jungle-stage text-[var(--text-cream)]">
      <div className="canopy-vignette" />
      <div className="gold-shaft" />
      <FloatingLeaves />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Camo size={28} className="animate-sway" />
            <span className="font-semibold tracking-tight">PageLifeguard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-sage)] hover:text-[var(--text-cream)] transition hidden sm:block">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm !py-1.5 !px-4">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <Image src="/assets/pat-eye.png" alt="" fill className="object-cover" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <AnimateIn>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Your pages change.
              <br />
              <span className="text-[var(--accent-jade)]">Camo catches it.</span>
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <p className="text-[var(--text-sage)] mt-5 text-lg max-w-md mx-auto">
              We watch your pages and tell you what changed — so you don&apos;t have to keep checking.
            </p>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link href="/signup" className="btn-primary text-base">Start free</Link>
              <a href="#how" className="btn-secondary text-base">How it works</a>
            </div>
          </AnimateIn>

          {/* Hero video - Camo catches a change! */}
          <AnimateIn delay={0.4}>
            <div className="mt-10 max-w-lg mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
              <video autoPlay loop muted playsInline className="w-full" poster="/assets/hero-camo-alarm.png">
                <source src="/assets/hero-camo-video.mp4" type="video/mp4" />
              </video>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* How */}
      <section id="how" className="section-band py-20 relative">
        <div className="section-line-top" />
        <div className="section-line-bottom" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex justify-center mb-3"><CamoPaw size={20} /></div>
          <p className="text-center text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14">Three steps. Zero effort.</h2>
          <StaggerContainer className="grid sm:grid-cols-3 gap-6">
            {[
              { t: "Feed Camo a URL", img: "/assets/step1-eat-url.png", video: "/assets/step1-eat-url-video.mp4", pat: "/assets/pat-eye.png" },
              { t: "Camo watches", img: "/assets/step2-scan.png", video: null, pat: "/assets/pat-chameleon.png" },
              { t: "Camo rings the bell!", img: "/assets/step3-bell.png", video: "/assets/step3-bell-video.mp4", pat: "/assets/pat-swirl.png" },
            ].map((s, i) => (
              <StaggerItem key={i} className="card-glass card-lift p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]">
                  <Image src={s.pat} alt="" fill className="object-cover" />
                </div>
                <div className="relative z-10">
                {s.video ? (
                  <div className="mx-auto mb-3 rounded-xl overflow-hidden w-[140px] h-[140px]">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover" poster={s.img}>
                      <source src={s.video} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <Image src={s.img} alt={s.t} width={140} height={140} className="mx-auto mb-3 rounded-xl" />
                )}
                <h3 className="font-semibold text-sm">{s.t}</h3>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex justify-center mb-3"><CamoEye size={22} /></div>
          <p className="text-center text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">Use cases</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14">What teams watch</h2>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { t: "Competitor pricing", img: "/assets/uc-big-pricing.png" },
              { t: "Regulations", img: "/assets/uc-big-legal.png" },
              { t: "Supplier costs", img: "/assets/uc-big-shopping.png" },
              { t: "Job postings", img: "/assets/uc-big-jobs.png" },
              { t: "Documentation", img: "/assets/uc-big-docs.png" },
              { t: "SEO changes", img: "/assets/uc-big-seo.png" },
            ].map((u, i) => (
              <StaggerItem key={i} className="card-glass card-lift overflow-hidden rounded-2xl">
                <div className="aspect-[16/10] relative">
                  <Image src={u.img} alt={u.t} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <h3 className="absolute bottom-3 left-4 font-semibold text-sm text-white drop-shadow-lg">{u.t}</h3>
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
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <CamoStripes className="max-w-xs mx-auto mb-4" />
          <p className="text-center text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Simple and transparent</h2>
          <AnimateIn>
            <Image src="/assets/pricing-gameshow.png" alt="" width={400} height={225} className="mx-auto mb-8 rounded-xl" />
          </AnimateIn>
          <StaggerContainer className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Free", price: "$0", per: "", desc: "14-day free trial", features: ["3 monitors", "Daily checks", "AI summaries", "Email alerts", "7-day history"], pop: false, pattern: "/assets/pat-leaves.png" },
              { name: "Pro", price: "$19", per: "/mo", desc: "For professionals", features: ["20 monitors", "Hourly checks", "Slack + Email alerts", "CSS selectors", "90-day history", "Golden Set Generator", "Noise filtering"], pop: true, pattern: "/assets/pat-scales.png" },
              { name: "Business", price: "$49", per: "/mo", desc: "For teams", features: ["100 monitors", "15-min checks", "API access", "Team members (5)", "365-day history", "Priority support", "Custom webhooks", "Export reports"], pop: false, pattern: "/assets/pat-spiral.png" },
            ].map((p) => (
              <StaggerItem key={p.name} className={`relative overflow-hidden card-lift ${p.pop ? "card-glass-featured p-6" : "card-glass p-6"}`}>
                <div className="absolute inset-0 opacity-[0.06]">
                  <Image src={p.pattern} alt="" fill className="object-cover" />
                </div>
                <div className="relative z-10">
                {p.pop && <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-wider">Most popular</span>}
                <h3 className="font-semibold mt-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
                <div className="mt-3 mb-5">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-[var(--text-muted)] text-sm">{p.per}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-[var(--text-sage)] flex items-center gap-2">
                      <CamoPaw size={14} />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center text-sm ${p.pop ? "btn-primary" : "btn-secondary"}`}>
                  {p.name === "Free" ? "Start free" : "Try free"}
                </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <Image src="/assets/pat-camo2.png" alt="" fill className="object-cover" />
        </div>
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <Image src="/assets/cta-rocket.png" alt="" width={120} height={120} className="mx-auto mb-6 rounded-xl" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to launch?</h2>
          <p className="text-[var(--text-muted)] mb-8">Free forever. 3 monitors. 30 seconds setup.</p>
          <Link href="/signup" className="btn-primary text-lg">Get started free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 py-10 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">Product</p>
              <div className="space-y-2 text-xs text-[var(--text-muted)]">
                <Link href="/signup" className="block hover:text-[var(--accent-jade)] transition">Get started</Link>
                <a href="#pricing" className="block hover:text-[var(--accent-jade)] transition">Pricing</a>
                <a href="#how" className="block hover:text-[var(--accent-jade)] transition">How it works</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">Legal</p>
              <div className="space-y-2 text-xs text-[var(--text-muted)]">
                <Link href="/terms" className="block hover:text-[var(--accent-jade)] transition">Terms & Conditions</Link>
                <Link href="/privacy" className="block hover:text-[var(--accent-jade)] transition">Privacy Policy</Link>
                <Link href="/refund" className="block hover:text-[var(--accent-jade)] transition">Refund Policy</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">Support</p>
              <div className="space-y-2 text-xs text-[var(--text-muted)]">
                <a href="mailto:support@pagelifeguard.com" className="block hover:text-[var(--accent-jade)] transition">support@pagelifeguard.com</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">Account</p>
              <div className="space-y-2 text-xs text-[var(--text-muted)]">
                <Link href="/login" className="block hover:text-[var(--accent-jade)] transition">Sign in</Link>
                <Link href="/signup" className="block hover:text-[var(--accent-jade)] transition">Sign up</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <Camo size={16} />
              <span>&copy; {new Date().getFullYear()} PageLifeguard. All rights reserved.</span>
            </div>
            <span>Payments processed by <a href="https://paddle.com" className="text-[var(--accent-jade)] hover:underline">Paddle</a></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
