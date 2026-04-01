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

      {/* Demo video - the "aha moment" */}
      <section className="py-12 relative">
        <div className="max-w-3xl mx-auto px-6">
          <AnimateIn>
            <p className="text-center text-sm font-medium text-[var(--accent-gold)] mb-3 tracking-wider uppercase">See the magic</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">The &quot;aha!&quot; moment</h2>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
              <video autoPlay loop muted playsInline className="w-full" poster="/assets/demo-aha-moment.png">
                <source src="/assets/demo-aha-video.mp4" type="video/mp4" />
              </video>
            </div>
            <p className="text-center text-xs text-[var(--text-muted)] mt-4">A competitor changed their price. Camo caught it instantly.</p>
          </AnimateIn>
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

// Inline icons using Heroicons paths
function LinkIcon() { return <svg className="w-5 h-5 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>; }
function BellIcon() { return <svg className="w-5 h-5 text-[var(--accent-lime)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>; }
function TagIcon() { return <svg className="w-4 h-4 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /></svg>; }
function ShieldIcon() { return <svg className="w-4 h-4 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>; }
function TruckIcon() { return <svg className="w-4 h-4 text-[var(--accent-ember)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>; }
function BriefcaseIcon() { return <svg className="w-4 h-4 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>; }
function FileIcon() { return <svg className="w-4 h-4 text-[var(--accent-lime)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>; }
function SearchIcon() { return <svg className="w-4 h-4 text-[var(--accent-jade)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>; }
