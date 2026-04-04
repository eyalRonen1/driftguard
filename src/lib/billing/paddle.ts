/**
 * Paddle billing integration for Zikit.
 */

import { db } from "@/lib/db";
import { organizations, monitors } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const PLAN_LIMITS = {
  free: { monitors: 3, checkFrequency: ["daily", "weekly"], cssSelector: false, slackAlerts: false, export: false, checksPerMonth: 100 },
  pro: { monitors: 20, checkFrequency: ["hourly", "every_6h", "daily", "weekly"], cssSelector: true, slackAlerts: true, export: true, checksPerMonth: 2000 },
  business: { monitors: 100, checkFrequency: ["15min", "hourly", "every_6h", "daily", "weekly"], cssSelector: true, slackAlerts: true, export: true, checksPerMonth: 10000 },
} as const;

export type PlanCode = keyof typeof PLAN_LIMITS;

interface PaddleWebhookEvent {
  event_type: string;
  data: {
    id?: string;
    customer_id?: string;
    status?: string;
    custom_data?: { org_id?: string };
    current_billing_period?: { starts_at?: string; ends_at?: string };
    scheduled_change?: { action?: string; effective_at?: string };
    items?: Array<{
      price?: { id?: string; product_id?: string };
      price_id?: string;
      product_id?: string;
    }>;
  };
}

// Price IDs from Paddle dashboard
const PRICE_TO_PLAN: Record<string, PlanCode> = {
  // Sandbox
  "pri_01kn70ew9pqf4jym0aaszttzt9": "pro",
  "pri_01kn70f5jcahzyphtz48mbdx15": "business",
  // Production
  "pri_01kn8185pa1ne42gnkhd2yfmhh": "pro",
  "pri_01kn8186qbsey8bdwjbc2j943e": "business",
};

// Product ID fallback mapping
const PRODUCT_TO_PLAN: Record<string, PlanCode> = {
  // Sandbox
  "pro_01kn70e1e06hab170k494nr7kb": "pro",
  "pro_01kn70egs0p1ryh8qxw7nyt1pq": "business",
  // Production
  "pro_01kn817smxmkvvp03y5bdn136p": "pro",
  "pro_01kn817vhh6ys4y3msa0pka21b": "business",
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
 * After downgrading an org, enforce the target plan's limits:
 * 1. Pause monitors that exceed the plan's monitor limit
 * 2. Downgrade check frequency on remaining monitors if needed
 */
async function enforceDowngradeLimits(orgId: string, targetPlan: PlanCode = "free") {
  const limits = PLAN_LIMITS[targetPlan];
  const allowedFrequencies = limits.checkFrequency as readonly string[];

  // Get all active, unpaused monitors for the org, newest first
  const orgMonitors = await db
    .select({ id: monitors.id, checkFrequency: monitors.checkFrequency })
    .from(monitors)
    .where(
      and(
        eq(monitors.orgId, orgId),
        eq(monitors.isActive, true),
        eq(monitors.isPaused, false),
      ),
    )
    .orderBy(desc(monitors.createdAt));

  // Pause excess monitors (keep the oldest ones active)
  if (orgMonitors.length > limits.monitors) {
    const toPause = orgMonitors.slice(limits.monitors);
    for (const m of toPause) {
      await db
        .update(monitors)
        .set({ isPaused: true, updatedAt: new Date() })
        .where(eq(monitors.id, m.id));
    }
    console.warn(`Paused ${toPause.length} excess monitor(s) for org ${orgId} after downgrade`);
  }

  // Downgrade frequency on remaining active monitors
  const activeMonitors = orgMonitors.slice(0, limits.monitors);
  for (const m of activeMonitors) {
    if (!allowedFrequencies.includes(m.checkFrequency)) {
      await db
        .update(monitors)
        .set({ checkFrequency: "daily", updatedAt: new Date() })
        .where(eq(monitors.id, m.id));
      console.warn(`Downgraded frequency for monitor ${m.id} from ${m.checkFrequency} to daily`);
    }
  }
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
      const periodEndsAt = event.data.current_billing_period?.ends_at;

      await db
        .update(organizations)
        .set({
          plan,
          paddleCustomerId: event.data.customer_id || null,
          paddleSubscriptionId: event.data.id || null,
          paddleSubscriptionStatus: event.data.status || "active",
          monthlyCheckQuota: limits.checksPerMonth,
          billingPeriodEndsAt: periodEndsAt ? new Date(periodEndsAt) : null,
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
        await enforceDowngradeLimits(orgId);
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

      await enforceDowngradeLimits(orgId);
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
          billingPeriodEndsAt: null,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));

      // Enforce free-tier limits (pause excess monitors + downgrade frequencies)
      await enforceDowngradeLimits(orgId);
      break;
    }
  }
}
