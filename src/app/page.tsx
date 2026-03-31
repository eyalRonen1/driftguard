import Link from "next/link";
import { LiveDemo } from "@/components/marketing/live-demo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PL</span>
            </div>
            <span className="font-semibold text-lg">PageLifeguard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full mb-6">
          Website Change Monitoring with AI Summaries
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Know when any webpage
          <br />
          <span className="text-blue-600">changes — in plain English</span>
        </h1>
        <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
          PageLifeguard monitors any URL and sends you AI-powered summaries of what changed.
          Not raw diffs — real insights like &quot;Competitor dropped prices by 15%.&quot;
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/signup"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium"
          >
            Start monitoring free
          </Link>
          <a
            href="#how-it-works"
            className="px-6 py-3 text-gray-600 hover:text-gray-900 transition text-lg"
          >
            How it works
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required. Free plan includes 3 monitors.</p>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">See it in action</h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-10">
            Watch how PageLifeguard detects a competitor price change and sends you an AI-powered alert.
          </p>
          <LiveDemo />
        </div>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Important pages change without warning</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
            Competitor pricing, regulatory pages, product listings, job boards — they all change.
            By the time you notice manually, it&apos;s too late.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Competitor pricing changes",
                desc: "Your competitor drops prices or launches a new plan. You find out from a customer, not your own intelligence.",
                icon: "💰",
              },
              {
                title: "Regulatory updates",
                desc: "A compliance page updates with new requirements. Your team misses it for weeks.",
                icon: "📋",
              },
              {
                title: "Content disappears",
                desc: "A key page gets removed or restructured. Links break, information vanishes.",
                icon: "🔍",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-xl border border-gray-200">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How PageLifeguard works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Paste a URL",
                desc: "Any public web page — competitor pricing, regulatory docs, job boards, product pages.",
              },
              {
                step: "2",
                title: "We check it for you",
                desc: "Daily, hourly, or every 15 minutes. We fetch the page and compare it to the last version.",
              },
              {
                step: "3",
                title: "Get smart alerts",
                desc: "When something changes, you get a plain-English summary: what changed, why it matters.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">More than a change detector</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AI Summaries", desc: "Not raw diffs. Plain-English descriptions: 'Price dropped from $49 to $39.'" },
              { title: "Importance Scoring", desc: "AI rates each change 1-10. Only get alerted on what actually matters." },
              { title: "Smart Filtering", desc: "Ignore timestamps, ads, and layout noise. Focus on real content changes." },
              { title: "Instant Alerts", desc: "Email and Slack notifications the moment something important changes." },
              { title: "CSS Selectors", desc: "Monitor just the pricing table, just the FAQ, or just the part you care about." },
              { title: "Zero Setup", desc: "Paste a URL and go. No code, no integration, no SDK." },
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-5 rounded-xl border border-gray-200">
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-500 text-center mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "For trying it out",
                features: ["3 monitors", "Daily checks", "AI summaries", "Email alerts"],
                cta: "Start free",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$19",
                desc: "For professionals",
                features: [
                  "20 monitors",
                  "Hourly checks",
                  "AI summaries",
                  "Email + Slack alerts",
                  "CSS selectors",
                  "Change history",
                ],
                cta: "Start free trial",
                highlighted: true,
              },
              {
                name: "Business",
                price: "$49",
                desc: "For teams & agencies",
                features: [
                  "100 monitors",
                  "Every 15 min checks",
                  "AI summaries",
                  "Priority alerts",
                  "API access",
                  "Team members",
                ],
                cta: "Start free trial",
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl border-2 ${
                  plan.highlighted
                    ? "border-blue-600 bg-blue-50/30"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold mt-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.desc}</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-gray-500">/month</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-2.5 rounded-lg transition font-medium ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop checking pages manually
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Set up monitoring in 30 seconds. Get AI summaries when things change.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition text-lg font-medium"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} PageLifeguard. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
