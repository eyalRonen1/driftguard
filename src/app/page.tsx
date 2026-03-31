import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DG</span>
            </div>
            <span className="font-semibold text-lg">DriftGuard</span>
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
          UptimeRobot for AI Chatbots
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Know when your chatbot
          <br />
          <span className="text-blue-600">starts giving wrong answers</span>
        </h1>
        <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
          DriftGuard monitors your AI chatbot 24/7. When knowledge bases change, models update,
          or prompts break — we catch the drift before your customers do.
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
        <p className="text-sm text-gray-400 mt-4">No credit card required. Free plan includes 1 bot.</p>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">The silent problem with AI chatbots</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
            Your chatbot worked perfectly yesterday. Today, someone updated the knowledge base,
            the model provider pushed a silent update, or a prompt was edited.
            Now it&apos;s giving wrong answers — and you don&apos;t know.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Knowledge base changes",
                desc: "Someone adds, removes, or edits a document. The chatbot now gives outdated or contradictory answers.",
                icon: "📄",
              },
              {
                title: "Model updates",
                desc: "Your LLM provider updates the model. Responses change subtly. No one notices for days.",
                icon: "🔄",
              },
              {
                title: "Prompt drift",
                desc: "A team member tweaks the system prompt. Quality degrades on edge cases no one tested.",
                icon: "💬",
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
          <h2 className="text-3xl font-bold text-center mb-12">How DriftGuard works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Connect your bot",
                desc: "Paste your chatbot API endpoint. Or let us auto-generate test questions from your website.",
              },
              {
                step: "2",
                title: "Define what matters",
                desc: "Add the questions your bot must answer correctly. Set priorities and match strategies.",
              },
              {
                step: "3",
                title: "Get alerted on drift",
                desc: "We test your bot daily. When answers change, you get an instant alert with a detailed diff.",
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
          <h2 className="text-3xl font-bold text-center mb-12">Built for teams that ship AI</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Health Score", desc: "0-100 score updated with every scan. Share with your team in seconds." },
              { title: "Golden Set Generator", desc: "We scan your website and auto-generate the most critical test questions." },
              { title: "LLM-as-Judge", desc: "Semantic comparison powered by AI. Not just keyword matching." },
              { title: "Instant Alerts", desc: "Email and Slack notifications the moment quality drops." },
              { title: "Scan Throttling", desc: "Human-like pacing between questions. Won't trigger your bot's rate limits." },
              { title: "Zero-Code Setup", desc: "No SDK, no integration. Just paste your endpoint and go." },
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
                features: ["1 chatbot", "5 test cases", "Weekly scans", "Email alerts"],
                cta: "Start free",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$29",
                desc: "For growing teams",
                features: [
                  "3 chatbots",
                  "50 test cases per bot",
                  "Daily scans",
                  "Email + Slack alerts",
                  "Golden Set Generator",
                  "Health Score dashboard",
                ],
                cta: "Start free trial",
                highlighted: true,
              },
              {
                name: "Business",
                price: "$79",
                desc: "For serious monitoring",
                features: [
                  "10 chatbots",
                  "200 test cases per bot",
                  "Hourly scans",
                  "Priority support",
                  "Advanced analytics",
                  "API access",
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
            Stop finding out from angry customers
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Set up monitoring in 60 seconds. Know the moment your chatbot drifts.
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
          <p>&copy; {new Date().getFullYear()} DriftGuard. All rights reserved.</p>
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
