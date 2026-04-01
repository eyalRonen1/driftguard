"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CamoPaw } from "@/components/brand/camo";

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "",
    description: "For trying it out",
    features: ["3 monitors", "Daily checks", "AI summaries", "Email alerts", "7-day history"],
    limits: { monitors: 3, frequency: "Daily", history: "7 days" },
    current: true,
  },
  {
    name: "Pro",
    price: 19,
    period: "/mo",
    description: "For professionals",
    popular: true,
    features: ["20 monitors", "Hourly checks", "Slack + Email", "CSS selectors", "90-day history", "Golden Set Generator", "Noise filtering"],
    limits: { monitors: 20, frequency: "Hourly", history: "90 days" },
  },
  {
    name: "Business",
    price: 49,
    period: "/mo",
    description: "For teams",
    features: ["100 monitors", "15-min checks", "API access", "5 team members", "365-day history", "Priority support", "Custom webhooks", "Export reports"],
    limits: { monitors: 100, frequency: "15 min", history: "1 year" },
  },
];

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Image src="/assets/camo-happy.png" alt="" width={32} height={32} />
        <div>
          <h1 className="text-xl font-bold">Plans & Billing</h1>
          <p className="text-sm text-muted-foreground">Choose the right plan for your needs</p>
        </div>
      </div>

      {/* Current plan banner */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-lg font-bold">Free</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Usage this month</p>
            <p className="text-lg font-bold">0 / 100 checks</p>
          </div>
        </CardContent>
      </Card>

      {/* Plans grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`relative overflow-hidden ${plan.popular ? "border-primary/30 shadow-[0_0_20px_rgba(124,203,139,0.1)]" : ""}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">
                Popular
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              {/* Limits visual */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-muted/30">
                <div className="text-center">
                  <p className="text-lg font-bold">{plan.limits.monitors}</p>
                  <p className="text-[9px] text-muted-foreground">monitors</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">{plan.limits.frequency}</p>
                  <p className="text-[9px] text-muted-foreground">checks</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">{plan.limits.history}</p>
                  <p className="text-[9px] text-muted-foreground">history</p>
                </div>
              </div>

              <ul className="space-y-1.5 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CamoPaw size={10} />{f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.current ? "outline" : plan.popular ? "default" : "secondary"}
                className="w-full"
                disabled={plan.current}
              >
                {plan.current ? "Current plan" : `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Common questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { q: "Can I change plans anytime?", a: "Yes, upgrade or downgrade instantly. No lock-in." },
            { q: "What happens when I hit the limit?", a: "We'll notify you. Existing monitors keep running." },
            { q: "Do you offer annual billing?", a: "Coming soon with a 20% discount." },
            { q: "How do refunds work?", a: "30-day money-back guarantee, no questions asked." },
          ].map((faq) => (
            <div key={faq.q}>
              <p className="text-sm font-medium">{faq.q}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
