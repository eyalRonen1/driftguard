import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedOrg } from "@/lib/db/get-org";

const PADDLE_API = process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox"
  ? "https://sandbox-api.paddle.com"
  : "https://api.paddle.com";

const PRICE_IDS: Record<string, string> = process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox"
  ? { pro: "pri_01kn70ew9pqf4jym0aaszttzt9", business: "pri_01kn70f5jcahzyphtz48mbdx15" }
  : { pro: "pri_01kn8185pa1ne42gnkhd2yfmhh", business: "pri_01kn8186qbsey8bdwjbc2j943e" };

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { org } = auth;
  if (!org.paddleSubscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  const body = await request.json();
  const targetPlan = body.plan?.toLowerCase();
  if (!targetPlan || !PRICE_IDS[targetPlan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (org.plan === targetPlan) {
    return NextResponse.json({ error: "Already on this plan" }, { status: 400 });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });

  // Update subscription with proration — Paddle handles the billing math
  const res = await fetch(`${PADDLE_API}/subscriptions/${org.paddleSubscriptionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      items: [{ price_id: PRICE_IDS[targetPlan], quantity: 1 }],
      proration_billing_mode: "prorated_immediately",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Paddle update failed:", err);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
