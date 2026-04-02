import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import Image from "next/image";
import { CamoPaw } from "@/components/brand/camo";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";

const PLANS = [
  {
    name: "Free",
    code: "free",
    price: 0,
    period: "",
    description: "Get started — no credit card needed",
    features: ["3 monitors", "Daily checks", "AI summaries", "Email alerts", "7-day history"],
    limits: { monitors: 3, frequency: "Daily", history: "7 days" },
    pattern: "/assets/pat-leaves.webp",
  },
  {
    name: "Pro",
    code: "pro",
    price: 19,
    period: "/mo",
    description: "For professionals who need more",
    popular: true,
    features: ["20 monitors", "Hourly checks", "Slack + Email", "CSS selectors", "90-day history", "Keyword monitoring", "Noise filtering"],
    limits: { monitors: 20, frequency: "Hourly", history: "90 days" },
    pattern: "/assets/pat-scales.webp",
  },
  {
    name: "Business",
    code: "business",
    price: 49,
    period: "/mo",
    description: "For teams that move fast",
    features: ["100 monitors", "15-min checks", "API access", "5 team members", "365-day history", "Priority support", "Custom webhooks", "CSV export"],
    limits: { monitors: 100, frequency: "15 min", history: "1 year" },
    pattern: "/assets/pat-spiral.webp",
  },
];

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let org;
  try {
    const result = await ensureUserAndOrg(user);
    org = result.org;
  } catch {
    return <p className="text-[var(--text-muted)] p-8 text-center">Loading...</p>;
  }

  const currentPlan = PLANS.find((p) => p.code === org.plan) || PLANS[0];
  const usagePercent = Math.min(100, Math.round((org.monthlyChecksUsed / org.monthlyCheckQuota) * 100));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Image src="/assets/camo-happy.webp" alt="" width={32} height={32} />
        <div>
          <h1 className="text-xl font-bold text-[var(--text-cream)]">Plans & Billing</h1>
          <p className="text-sm text-[var(--text-muted)]">Choose the right plan for your needs</p>
        </div>
      </div>

      {/* Current plan + Usage */}
      <div className="card-glass rounded-2xl p-5 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <Image src="/assets/pat-chameleon.webp" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Current plan</p>
            <p className="text-2xl font-bold text-[var(--accent-jade)] capitalize">{org.plan}</p>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Monthly usage</p>
              <p className="text-xs text-[var(--text-cream)] font-medium">{org.monthlyChecksUsed} / {org.monthlyCheckQuota}</p>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent > 80 ? "bg-[var(--accent-ruby)]" : usagePercent > 50 ? "bg-[var(--accent-gold)]" : "bg-[var(--accent-jade)]"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => {
          const isCurrent = plan.code === org.plan;
          return (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-2xl transition-all ${
                plan.popular ? "card-glass-featured" : "card-glass"
              } ${isCurrent ? "ring-2 ring-[var(--accent-jade)]/40" : ""}`}
            >
              {/* Pattern background */}
              <div className="absolute inset-0 opacity-[0.04]">
                <Image src={plan.pattern} alt="" fill className="object-cover" />
              </div>

              <div className="relative z-10 p-5">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  {plan.popular && (
                    <span className="text-[9px] font-bold text-[var(--accent-gold)] uppercase tracking-wider bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded-full">
                      Most popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-[var(--accent-jade)] uppercase tracking-wider bg-[var(--accent-jade)]/10 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>

                {/* Name + description */}
                <h3 className="font-semibold text-[var(--text-cream)]">{plan.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-3xl font-bold text-[var(--text-cream)]">${plan.price}</span>
                  <span className="text-[var(--text-muted)] text-sm">{plan.period}</span>
                </div>

                {/* Limits visual */}
                <div className="grid grid-cols-3 gap-1 mb-5">
                  {Object.entries(plan.limits).map(([key, val]) => (
                    <div key={key} className="text-center p-2 rounded-lg bg-white/5">
                      <p className="text-sm font-bold text-[var(--text-cream)]">{val}</p>
                      <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">{key}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-[var(--text-sage)] flex items-center gap-2">
                      <CamoPaw size={10} />{f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <UpgradeButton
                  plan={plan.name}
                  label={plan.price > currentPlan.price ? `Upgrade to ${plan.name}` : plan.price === currentPlan.price ? "Current plan" : `Switch to ${plan.name}`}
                  variant={plan.popular ? "default" : "secondary"}
                  isCurrent={isCurrent}
                  orgId={org.id}
                  userEmail={user.email || undefined}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="card-glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-[var(--text-cream)] mb-4 flex items-center gap-2">
          <Image src="/assets/camo-watch.webp" alt="" width={20} height={20} />
          Common questions
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { q: "Can I change plans anytime?", a: "Yes — upgrade or downgrade instantly. No lock-in." },
            { q: "What happens when I hit the limit?", a: "We'll notify you. Existing monitors keep running." },
            { q: "Do you offer annual billing?", a: "Coming soon with a 20% discount." },
            { q: "How do refunds work?", a: "30-day money-back guarantee, no questions asked." },
          ].map((faq) => (
            <div key={faq.q} className="p-3 rounded-lg bg-white/3">
              <p className="text-sm font-medium text-[var(--text-cream)]">{faq.q}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
