/**
 * Paddle billing integration for PageLifeguard.
 */

import { db } from "@/lib/db";
import { organizations, monitors } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const PLAN_LIMITS = {
  free: { monitors: 3, checkFrequency: ["daily", "weekly"], checksPerMonth: 100 },
  pro: { monitors: 20, checkFrequency: ["15min", "hourly", "every_6h", "daily", "weekly"], checksPerMonth: 2000 },
  business: { monitors: 100, checkFrequency: ["15min", "hourly", "every_6h", "daily", "weekly"], checksPerMonth: 10000 },
} as const;

export type PlanCode = keyof typeof PLAN_LIMITS;

interface PaddleWebhookEvent {
  event_type: string;
  data: {
    id?: string;
    customer_id?: string;
    status?: string;
    custom_data?: { org_id?: string };
    items?: Array<{
      price?: { id?: string; product_id?: string };
      price_id?: string;
      product_id?: string;
    }>;
  };
}

// Price IDs from Paddle dashboard -- update these after creating products
const PRICE_TO_PLAN: Record<string, PlanCode> = {
  // Sandbox price IDs (replace with production IDs)
  "pri_sandbox_pro_monthly": "pro",
  "pri_sandbox_business_monthly": "business",
  // Add production IDs here when you create Paddle products
};

// Product ID fallback mapping (in case price IDs change but product IDs stay stable)
const PRODUCT_TO_PLAN: Record<string, PlanCode> = {
  "pro_sandbox_pro": "pro",
  "pro_sandbox_business": "business",
};

/**
 * Resolve a PlanCode from a price ID, falling back to product ID detection
 * and then subscription item inspection before defaulting to "free".
 */
export function getPlanFromPriceId(
  priceId: string | undefined | null,
  event?: PaddleWebhookEvent,
): PlanCode {
  // Direct price ID lookup
  if (priceId && PRICE_TO_PLAN[priceId]) {
    return PRICE_TO_PLAN[priceId];
  }

  // Try to detect from subscription items in the event data
  if (event?.data?.items?.length) {
    const item = event.data.items[0];

    // Try item-level price_id (flat structure in some Paddle versions)
    const itemPriceId = item.price_id ?? item.price?.id;
    if (itemPriceId && PRICE_TO_PLAN[itemPriceId]) {
      return PRICE_TO_PLAN[itemPriceId];
    }

    // Try product ID fallback
    const productId = item.product_id ?? item.price?.product_id;
    if (productId && PRODUCT_TO_PLAN[productId]) {
      return PRODUCT_TO_PLAN[productId];
    }

    // Heuristic: if a price ID contains "business", assume business; "pro" -> pro
    const anyId = itemPriceId ?? productId ?? "";
    if (anyId.toLowerCase().includes("business")) return "business";
    if (anyId.toLowerCase().includes("pro")) return "pro";
  }

  return "free";
}

function logMissingOrg(eventType: string, data: PaddleWebhookEvent["data"]) {
  console.warn(`Paddle webhook ${eventType}: missing org_id in custom_data, skipping`, {
    subscriptionId: data.id,
    customerId: data.customer_id,
  });
}

/**
 * After downgrading an org to the free plan, pause any monitors that exceed
 * the free-tier limit (3). The newest monitors (by createdAt) are paused first.
 */
async function pauseExcessMonitors(orgId: string) {
  const freeLimit = PLAN_LIMITS.free.monitors;

  // Get all active, unpaused monitors for the org, newest first
  const orgMonitors = await db
    .select({ id: monitors.id })
    .from(monitors)
    .where(
      and(
        eq(monitors.orgId, orgId),
        eq(monitors.isActive, true),
        eq(monitors.isPaused, false),
      ),
    )
    .orderBy(desc(monitors.createdAt));

  if (orgMonitors.length <= freeLimit) return;

  // Pause everything beyond the free limit (keep the oldest ones active)
  const toPause = orgMonitors.slice(freeLimit);
  for (const m of toPause) {
    await db
      .update(monitors)
      .set({ isPaused: true, updatedAt: new Date() })
      .where(eq(monitors.id, m.id));
  }

  console.log(
    `Paused ${toPause.length} excess monitor(s) for org ${orgId} after downgrade to free`,
  );
}

export async function handlePaddleWebhook(event: PaddleWebhookEvent) {
  const orgId = event.data?.custom_data?.org_id;

  switch (event.event_type) {
    // ── Subscription created or activated ──────────────────────────
    case "subscription.created":
    case "subscription.activated": {
      if (!orgId) { logMissingOrg(event.event_type, event.data); break; }

      const priceId = event.data.items?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId, event);
      const limits = PLAN_LIMITS[plan];

      await db
        .update(organizations)
        .set({
          plan,
          paddleCustomerId: event.data.customer_id || null,
          paddleSubscriptionId: event.data.id || null,
          paddleSubscriptionStatus: event.data.status || "active",
          monthlyCheckQuota: limits.checksPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      break;
    }

    // ── Subscription updated (plan change / upgrade / downgrade) ──
    case "subscription.updated": {
      if (!orgId) { logMissingOrg(event.event_type, event.data); break; }

      const priceId = event.data.items?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId, event);
      const limits = PLAN_LIMITS[plan];

      await db
        .update(organizations)
        .set({
          plan,
          paddleSubscriptionStatus: event.data.status || "active",
          monthlyCheckQuota: limits.checksPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));

      // If downgraded, pause excess monitors
      if (plan === "free") {
        await pauseExcessMonitors(orgId);
      }
      break;
    }

    // ── Subscription paused ───────────────────────────────────────
    case "subscription.paused": {
      if (!orgId) { logMissingOrg(event.event_type, event.data); break; }

      // Temporarily treat as free, but keep the subscription ID so we can
      // restore when resumed.
      await db
        .update(organizations)
        .set({
          plan: "free",
          paddleSubscriptionStatus: "paused",
          monthlyCheckQuota: PLAN_LIMITS.free.checksPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));

      await pauseExcessMonitors(orgId);
      break;
    }

    // ── Subscription resumed ──────────────────────────────────────
    case "subscription.resumed": {
      if (!orgId) { logMissingOrg(event.event_type, event.data); break; }

      const priceId = event.data.items?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId, event);
      const limits = PLAN_LIMITS[plan];

      await db
        .update(organizations)
        .set({
          plan,
          paddleSubscriptionStatus: event.data.status || "active",
          monthlyCheckQuota: limits.checksPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      break;
    }

    // ── Subscription canceled ─────────────────────────────────────
    case "subscription.canceled": {
      if (!orgId) { logMissingOrg(event.event_type, event.data); break; }

      await db
        .update(organizations)
        .set({
          plan: "free",
          paddleSubscriptionId: null,
          paddleSubscriptionStatus: "canceled",
          monthlyCheckQuota: PLAN_LIMITS.free.checksPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));

      // Pause monitors that exceed the free-tier limit
      await pauseExcessMonitors(orgId);
      break;
    }
  }
}
