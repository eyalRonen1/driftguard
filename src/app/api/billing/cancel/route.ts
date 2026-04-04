import { NextResponse } from "next/server";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PLAN_LIMITS } from "@/lib/billing/paddle";

const PADDLE_API = process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox"
  ? "https://sandbox-api.paddle.com"
  : "https://api.paddle.com";

/** Fetch billing period end date from Paddle subscription */
async function fetchBillingEndDate(subscriptionId: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${PADDLE_API}/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.scheduled_change?.effective_at
      || data.data?.current_billing_period?.ends_at
      || null;
  } catch {
    return null;
  }
}

export async function POST() {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { org } = auth;

  if (org.plan === "free") {
    return NextResponse.json({ error: "Already on free plan" }, { status: 400 });
  }

  // Already scheduled for cancel — just return the date
  if (org.paddleSubscriptionStatus === "scheduled_cancel") {
    const endsAt = org.billingPeriodEndsAt?.toISOString() || null;
    return NextResponse.json({
      ok: true,
      endsAt,
      message: endsAt
        ? `Already scheduled. Your plan will switch to Free on ${new Date(endsAt).toLocaleDateString()}. You keep full access until then.`
        : "Your cancellation is already scheduled for the end of your billing period.",
    });
  }

  const apiKey = process.env.PADDLE_API_KEY;

  // If there's a Paddle subscription, cancel through Paddle API
  if (org.paddleSubscriptionId && apiKey) {
    const cancelRes = await fetch(`${PADDLE_API}/subscriptions/${org.paddleSubscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        effective_from: "next_billing_period",
      }),
    });

    if (cancelRes.ok) {
      // Cancel succeeded — get billing period end date
      const endsAt = await fetchBillingEndDate(org.paddleSubscriptionId, apiKey);

      const updateData: Record<string, any> = {
        paddleSubscriptionStatus: "scheduled_cancel",
        updatedAt: new Date(),
      };
      if (endsAt) {
        updateData.billingPeriodEndsAt = new Date(endsAt);
      }
      await db.update(organizations).set(updateData).where(eq(organizations.id, org.id));

      return NextResponse.json({
        ok: true,
        endsAt,
        message: endsAt
          ? `Your plan will switch to Free on ${new Date(endsAt).toLocaleDateString()}. You keep full access until then.`
          : "Your plan will switch to Free at the end of your billing period. You keep full access until then.",
      });
    }

    // Paddle returned an error
    const status = cancelRes.status;
    const errBody = await cancelRes.text().catch(() => "");
    console.error(`Paddle cancel failed (${status}):`, errBody);

    // Check if Paddle says already scheduled for cancel (409 conflict or similar)
    if (errBody.includes("schedule") || errBody.includes("cancel")) {
      const endsAt = await fetchBillingEndDate(org.paddleSubscriptionId, apiKey);
      if (endsAt) {
        await db.update(organizations).set({
          paddleSubscriptionStatus: "scheduled_cancel",
          billingPeriodEndsAt: new Date(endsAt),
          updatedAt: new Date(),
        }).where(eq(organizations.id, org.id));

        return NextResponse.json({
          ok: true,
          endsAt,
          message: `Your plan will switch to Free on ${new Date(endsAt).toLocaleDateString()}. You keep full access until then.`,
        });
      }
    }

    // 404 = subscription doesn't exist in Paddle — stale ID, fall through
    if (status === 404 || errBody.includes("not_found")) {
      console.warn("Clearing stale paddleSubscriptionId:", org.paddleSubscriptionId);
    } else {
      // Real error — do NOT downgrade, ask user to retry
      return NextResponse.json(
        { error: "Unable to cancel subscription. Please try again or contact support@zikit.ai" },
        { status: 500 }
      );
    }
  }

  // No Paddle subscription (or stale 404) — downgrade directly
  await db
    .update(organizations)
    .set({
      plan: "free",
      monthlyCheckQuota: PLAN_LIMITS.free.checksPerMonth,
      paddleSubscriptionId: null,
      paddleSubscriptionStatus: null,
      billingPeriodEndsAt: null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, org.id));

  return NextResponse.json({ ok: true, message: "Switched to Free plan." });
}
