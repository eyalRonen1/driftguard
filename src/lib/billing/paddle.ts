/**
 * Paddle billing integration.
 * Handles webhook events and subscription lifecycle.
 */

import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Plan limits
export const PLAN_LIMITS = {
  free: { bots: 1, testsPerBot: 5, scansPerMonth: 30, scanFrequency: ["weekly", "manual"] },
  pro: { bots: 3, testsPerBot: 50, scansPerMonth: 500, scanFrequency: ["hourly", "every_6h", "daily", "weekly", "manual"] },
  business: { bots: 10, testsPerBot: 200, scansPerMonth: 5000, scanFrequency: ["hourly", "every_6h", "daily", "weekly", "manual"] },
} as const;

export type PlanCode = keyof typeof PLAN_LIMITS;

interface PaddleWebhookEvent {
  event_type: string;
  data: {
    id?: string;
    customer_id?: string;
    status?: string;
    custom_data?: { org_id?: string };
    items?: Array<{ price?: { id?: string } }>;
  };
}

/**
 * Map Paddle price IDs to plan codes.
 * These IDs come from the Paddle dashboard after creating products.
 */
const PRICE_TO_PLAN: Record<string, PlanCode> = {
  // These will be filled in after creating products in Paddle
  // Format: "pri_xxx": "pro"
};

export function getPlanFromPriceId(priceId: string): PlanCode {
  return PRICE_TO_PLAN[priceId] || "free";
}

/**
 * Process Paddle webhook events
 */
export async function handlePaddleWebhook(event: PaddleWebhookEvent) {
  const orgId = event.data?.custom_data?.org_id;

  switch (event.event_type) {
    case "subscription.created":
    case "subscription.activated": {
      if (!orgId) break;
      const priceId = event.data.items?.[0]?.price?.id;
      const plan = priceId ? getPlanFromPriceId(priceId) : "pro";
      const limits = PLAN_LIMITS[plan];

      await db
        .update(organizations)
        .set({
          plan,
          paddleCustomerId: event.data.customer_id || null,
          paddleSubscriptionId: event.data.id || null,
          paddleSubscriptionStatus: event.data.status || "active",
          monthlyScanQuota: limits.scansPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      break;
    }

    case "subscription.updated": {
      if (!orgId) break;
      const priceId = event.data.items?.[0]?.price?.id;
      const plan = priceId ? getPlanFromPriceId(priceId) : "pro";
      const limits = PLAN_LIMITS[plan];

      await db
        .update(organizations)
        .set({
          plan,
          paddleSubscriptionStatus: event.data.status || "active",
          monthlyScanQuota: limits.scansPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      break;
    }

    case "subscription.canceled":
    case "subscription.past_due": {
      if (!orgId) break;

      if (event.event_type === "subscription.canceled") {
        // Downgrade to free at period end
        const freeLimits = PLAN_LIMITS.free;
        await db
          .update(organizations)
          .set({
            plan: "free",
            paddleSubscriptionStatus: "canceled",
            monthlyScanQuota: freeLimits.scansPerMonth,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, orgId));
      } else {
        await db
          .update(organizations)
          .set({
            paddleSubscriptionStatus: "past_due",
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, orgId));
      }
      break;
    }
  }
}
