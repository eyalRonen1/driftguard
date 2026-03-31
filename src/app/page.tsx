import Link from "next/link";
import Image from "next/image";
import { LiveUrlChecker } from "@/components/marketing/live-url-checker";
import { NotificationPreview } from "@/components/marketing/notification-preview";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/assets/logo-icon.png" alt="PageLifeguard" width={28} height={28} className="rounded-md" />
            <span className="font-semibold tracking-tight">PageLifeguard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition hidden sm:block">Sign in</Link>
            <Link href="/signup" className="text-sm px-4 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero grid-pattern pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Website changes,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              explained by AI
            </span>
          </h1>
          <p className="text-gray-500 mt-5 text-lg max-w-lg mx-auto">
            Monitor any page. Get summaries, not diffs.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/signup" className="px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition font-medium">
              Start free
            </Link>
            <a href="#demo" className="px-5 py-2.5 text-gray-500 hover:text-gray-900 transition">
              See demo
            </a>
          </div>
          {/* Hero image */}
          <div className="mt-12 max-w-3xl mx-auto">
            <Image
              src="/assets/hero-dashboard.png"
              alt="PageLifeguard Dashboard"
              width={1792}
              height={1024}
              className="rounded-xl shadow-2xl shadow-indigo-200/30 border border-gray-200/50"
              priority
            />
          </div>
        </div>
      </section>

      {/* Try it */}
      <section id="demo" className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-indigo-600 mb-3">Try it now</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Paste any URL</h2>
          <LiveUrlChecker />
        </div>
      </section>

      {/* How */}
      <section className="gradient-section py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-indigo-600 mb-3">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Three steps. Zero setup.</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: "01", t: "Add a URL", d: "Paste any public web page you want to watch." },
              { n: "02", t: "We check it", d: "Daily, hourly, or every 15 minutes." },
              { n: "03", t: "Get a summary", d: "AI explains what changed in plain English." },
            ].map((s) => (
              <div key={s.n}>
                <span className="text-xs font-mono text-indigo-400">{s.n}</span>
                <h3 className="font-semibold mt-1 mb-1">{s.t}</h3>
                <p className="text-sm text-gray-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts preview */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-indigo-600 mb-3">Smart alerts</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Not just &quot;page changed&quot;</h2>
          <NotificationPreview />
        </div>
      </section>

      {/* Use cases */}
      <section className="gradient-section py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-indigo-600 mb-3">Use cases</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Built for every team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { t: "Competitor pricing", d: "Know the moment a rival changes their plans." },
              { t: "Regulatory updates", d: "Track government and compliance pages." },
              { t: "Supplier monitoring", d: "Catch price increases before they hit margins." },
              { t: "Job board tracking", d: "See new postings from target companies." },
              { t: "Content changes", d: "Watch docs, blogs, and key web pages." },
              { t: "SEO monitoring", d: "Track competitor content and meta changes." },
            ].map((u) => (
              <div key={u.t} className="glow-card bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-sm mb-1">{u.t}</h3>
                <p className="text-sm text-gray-500">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-indigo-600 mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Simple and transparent</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Free", price: "$0", per: "", features: ["3 monitors", "Daily checks", "AI summaries", "Email alerts"], cta: "Get started", pop: false },
              { name: "Pro", price: "$19", per: "/mo", features: ["20 monitors", "Hourly checks", "Slack alerts", "CSS selectors", "Change history"], cta: "Start free trial", pop: true },
              { name: "Business", price: "$49", per: "/mo", features: ["100 monitors", "15-min checks", "API access", "Team members", "Priority support"], cta: "Start free trial", pop: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl p-5 border ${p.pop ? "border-indigo-200 bg-indigo-50/30 glow-primary" : "border-gray-200 bg-white"}`}>
                <h3 className="font-semibold">{p.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-gray-400 text-sm">{p.per}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center py-2 rounded-md text-sm font-medium transition ${p.pop ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-dark py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Stop checking pages manually</h2>
          <p className="text-gray-400 mb-8">Set up in 30 seconds. Free forever for 3 monitors.</p>
          <Link href="/signup" className="inline-block px-6 py-2.5 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition font-medium">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">PL</span>
            </div>
            <span>&copy; {new Date().getFullYear()} PageLifeguard</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-gray-600 transition">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-600 transition">Sign up</Link>
            <a href="#pricing" className="hover:text-gray-600 transition">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
