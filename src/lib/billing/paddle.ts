/**
 * Paddle billing integration for PageLifeguard.
 */

import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    items?: Array<{ price?: { id?: string } }>;
  };
}

const PRICE_TO_PLAN: Record<string, PlanCode> = {};

export function getPlanFromPriceId(priceId: string): PlanCode {
  return PRICE_TO_PLAN[priceId] || "free";
}

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
          monthlyCheckQuota: limits.checksPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      break;
    }

    case "subscription.canceled": {
      if (!orgId) break;
      await db
        .update(organizations)
        .set({
          plan: "free",
          paddleSubscriptionStatus: "canceled",
          monthlyCheckQuota: PLAN_LIMITS.free.checksPerMonth,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));
      break;
    }
  }
}
