import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-jungle-gradient relative">
      {/* Leaf pattern overlay */}
      <div className="fixed inset-0 leaf-pattern pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-jungle">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/camo-brand.png" alt="PageLifeguard" width={32} height={32} className="animate-sway" />
            <span className="font-semibold text-[var(--text-light)] tracking-tight">PageLifeguard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-light)] transition hidden sm:block">Sign in</Link>
            <Link href="/signup" className="btn-jungle text-sm !py-1.5 !px-4">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image src="/assets/jungle-bg.png" alt="" fill className="object-cover opacity-20" priority />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <Image src="/assets/camo-brand.png" alt="" width={100} height={100} className="mx-auto mb-6 drop-shadow-2xl animate-sway" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-[var(--text-light)]">
            Your pages change.
            <br />
            <span className="text-[var(--accent-lime)]">We catch it.</span>
          </h1>
          <p className="text-[var(--text-muted)] mt-5 text-lg max-w-md mx-auto">
            Like a chameleon watching the jungle — we see every change and tell you what it means.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/signup" className="btn-jungle">Start free</Link>
            <a href="#how" className="btn-vine">See how</a>
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-16 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-[var(--text-light)]">Three steps. Zero effort.</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Paste a URL", d: "Any page — competitor pricing, legal docs, job boards.", color: "text-[var(--accent-lime)]", img: null },
              { n: "2", t: "Camo watches", d: "We check daily, hourly, or every 15 minutes.", color: "text-[var(--accent-yellow)]", img: "/assets/camo-watching.png" },
              { n: "3", t: "Get a summary", d: "AI explains the change in plain English.", color: "text-[var(--accent-orange)]", img: "/assets/camo-alert.png" },
            ].map((s) => (
              <div key={s.n} className="card-jungle p-5 text-center">
                {s.img ? (
                  <Image src={s.img} alt="" width={48} height={48} className="mx-auto mb-2" />
                ) : (
                  <span className={`text-3xl font-bold ${s.color}`}>{s.n}</span>
                )}
                <h3 className="font-semibold mt-2 mb-1 text-[var(--text-light)]">{s.t}</h3>
                <p className="text-sm text-[var(--text-muted)]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-[var(--text-light)]">What to watch</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { t: "Competitor prices", d: "Know the moment they change plans." },
              { t: "Regulations", d: "Track government and compliance pages." },
              { t: "Supplier costs", d: "Catch increases before they hit margins." },
              { t: "Job postings", d: "See openings from target companies." },
              { t: "Documentation", d: "Watch API docs, blogs, changelogs." },
              { t: "SEO changes", d: "Track content and meta updates." },
            ].map((u) => (
              <div key={u.t} className="card-jungle p-4">
                <h3 className="font-semibold text-sm text-[var(--accent-lime)]">{u.t}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-[var(--text-light)]">Pricing</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Free", price: "$0", per: "", features: ["3 monitors", "Daily checks", "AI summaries", "Email alerts"], pop: false },
              { name: "Pro", price: "$19", per: "/mo", features: ["20 monitors", "Hourly checks", "Slack alerts", "CSS selectors", "History"], pop: true },
              { name: "Business", price: "$49", per: "/mo", features: ["100 monitors", "15-min checks", "API access", "Team members", "Priority"], pop: false },
            ].map((p) => (
              <div key={p.name} className={`card-jungle p-5 ${p.pop ? "!border-[var(--accent-lime)] !border-opacity-50 ring-1 ring-[var(--accent-lime)]/20" : ""}`}>
                {p.pop && <span className="text-[10px] font-bold text-[var(--accent-lime)] uppercase tracking-wider">Most popular</span>}
                <h3 className="font-semibold text-[var(--text-light)] mt-1">{p.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-[var(--text-light)]">{p.price}</span>
                  <span className="text-[var(--text-dim)] text-sm">{p.per}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                      <span className="text-[var(--accent-lime)]">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={p.pop ? "btn-jungle block text-center text-sm" : "btn-vine block text-center text-sm"}>
                  {p.name === "Free" ? "Start free" : "Try free"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Image src="/assets/camo-sleeping.png" alt="" width={80} height={80} className="mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-light)] mb-3">Let the chameleon do the watching</h2>
          <p className="text-[var(--text-muted)] mb-8">Set up in 30 seconds. Free forever for 3 monitors.</p>
          <Link href="/signup" className="btn-jungle text-lg">Get started free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--bg-moss)] py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-dim)]">
          <div className="flex items-center gap-2">
            <Image src="/assets/camo-brand.png" alt="" width={20} height={20} />
            <span>&copy; {new Date().getFullYear()} PageLifeguard</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-[var(--accent-lime)] transition">Sign in</Link>
            <Link href="/signup" className="hover:text-[var(--accent-lime)] transition">Sign up</Link>
            <a href="#pricing" className="hover:text-[var(--accent-lime)] transition">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
