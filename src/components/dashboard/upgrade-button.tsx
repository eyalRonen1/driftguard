"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// Paddle price IDs
const PRICE_IDS: Record<string, string> = {
  pro: "pri_01kn70ew9pqf4jym0aaszttzt9",
  business: "pri_01kn70f5jcahzyphtz48mbdx15",
};

export function UpgradeButton({
  plan,
  label,
  variant,
  isCurrent,
  orgId,
  userEmail,
}: {
  plan: string;
  label: string;
  variant: "default" | "secondary" | "outline";
  isCurrent: boolean;
  orgId?: string;
  userEmail?: string;
}) {
  const [loading, setLoading] = useState(false);

  // Load Paddle.js
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).Paddle) {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.onload = () => {
        const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (clientToken) {
          (window as any).Paddle.Environment.set("sandbox");
          (window as any).Paddle.Initialize({ token: clientToken });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  if (isCurrent) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  function handleUpgrade() {
    const priceId = PRICE_IDS[plan.toLowerCase()];
    if (!priceId) return;

    const paddle = (window as any).Paddle;
    if (!paddle) {
      // Paddle not loaded — fallback
      window.open(`mailto:support@zikit.ai?subject=Upgrade to ${plan}`, "_blank");
      return;
    }

    setLoading(true);

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { org_id: orgId },
      customer: userEmail ? { email: userEmail } : undefined,
      settings: {
        successUrl: window.location.origin + "/dashboard/billing?success=true",
        displayMode: "overlay",
        theme: "dark",
      },
    });

    // Reset loading after a delay (Paddle overlay handles the rest)
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <Button
      variant={variant}
      className="w-full"
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? "Opening checkout..." : label}
    </Button>
  );
}
