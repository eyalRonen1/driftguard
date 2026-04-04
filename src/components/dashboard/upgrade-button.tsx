"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Paddle price IDs for NEW subscriptions (checkout)
const PRICE_IDS: Record<string, string> = process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
  ? {
      pro: "pri_01kn8185pa1ne42gnkhd2yfmhh",
      business: "pri_01kn8186qbsey8bdwjbc2j943e",
    }
  : {
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
  currentPlan,
  hasSubscription,
  scheduledCancel,
  billingEndsAt,
}: {
  plan: string;
  label: string;
  variant: "default" | "secondary" | "outline";
  isCurrent: boolean;
  orgId?: string;
  userEmail?: string;
  currentPlan: string;
  hasSubscription: boolean;
  scheduledCancel?: boolean;
  billingEndsAt?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  // Load Paddle.js (only needed for new checkouts)
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).Paddle) {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.onload = () => {
        const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (clientToken) {
          if (process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox") {
            (window as any).Paddle.Environment.set("sandbox");
          }
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

  const targetPlan = plan.toLowerCase();
  const isDowngradeToFree = targetPlan === "free";

  // If cancel is already scheduled, show status on the Free card
  if (isDowngradeToFree && scheduledCancel) {
    const dateStr = billingEndsAt
      ? new Date(billingEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "end of period";
    return (
      <p className="text-xs text-[var(--accent-gold)] text-center py-2">
        Switching to Free on {dateStr}
      </p>
    );
  }
  async function executeAction() {
    setLoading(true);
    setError("");
    setShowConfirm(false);

    try {
      if (isDowngradeToFree) {
        const res = await fetch("/api/billing/cancel", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to cancel");
        setSuccessMsg(data.message || "Done!");
        setTimeout(() => router.refresh(), 3000);
      } else {
        // Upgrade or new subscription  - always use Paddle Checkout
        // This shows the user the exact price (including proration) before charging
        const priceId = PRICE_IDS[targetPlan];
        if (!priceId) return;

        const paddle = (window as any).Paddle;
        if (!paddle) {
          window.open(`mailto:support@zikit.ai?subject=Upgrade to ${plan}`, "_blank");
          return;
        }

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
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setTimeout(() => setLoading(false), 2000);
  }

  function handleClick() {
    // Show confirmation only for downgrades. Upgrades go through Paddle Checkout which shows the price.
    if (isDowngradeToFree) {
      setShowConfirm(true);
    } else {
      executeAction();
    }
  }

  if (successMsg) {
    return (
      <p className="text-xs text-[var(--accent-jade)] text-center py-2">{successMsg}</p>
    );
  }

  return (
    <div>
      {showConfirm ? (
        <div className="space-y-2">
          <p className="text-xs text-[var(--text-sage)]">
            {hasSubscription
              ? `Your ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} features will remain active until the end of your billing period. After that, monitors beyond the free limit will be paused.`
              : "You will lose paid features immediately. Monitors beyond the free limit (3) will be paused."
            }
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={executeAction}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant={variant}
          className="w-full"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? "Processing..." : label}
        </Button>
      )}
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}
