import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { alertConfigs, monitors, organizations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { getAuthenticatedOrgFromApiKey } from "@/lib/db/get-org-api-key";
import { rateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS, type PlanCode } from "@/lib/billing/paddle";
import { z } from "zod";
import { logActivity } from "@/lib/activity-log";

const alertConfigSchema = z.object({
  monitorId: z.string().uuid(),
  channel: z.enum(["email", "slack", "webhook", "discord", "telegram"]),
  destination: z.string().min(1).max(500),
  minImportance: z.number().int().min(1).max(10).default(3),
  isActive: z.boolean().default(true),
});

// GET /api/v1/alert-configs?monitorId=...
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed: readAllowed } = await rateLimit('alerts-read:' + auth.user.id, 60, 60000);
  if (!readAllowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const monitorId = request.nextUrl.searchParams.get("monitorId");

  try {
    let configs;
    if (monitorId) {
      // Verify monitor belongs to this org
      const [monitor] = await db.select().from(monitors)
        .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
        .limit(1);
      if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

      configs = await db.select().from(alertConfigs)
        .where(and(eq(alertConfigs.monitorId, monitorId), eq(alertConfigs.orgId, auth.org.id)));
    } else {
      configs = await db.select().from(alertConfigs)
        .where(eq(alertConfigs.orgId, auth.org.id));
    }

    return NextResponse.json({ configs });
  } catch (err) {
    console.error("Failed to fetch alert configs:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/alert-configs - Create or update an alert config
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed: writeAllowed } = await rateLimit('alerts-write:' + auth.user.id, 20, 60000);
  if (!writeAllowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = alertConfigSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => i.message).join(", ");
    return NextResponse.json(
      { error: `Please check your input: ${issues}` },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Plan-based channel gating
  const plan = (auth.org.plan || "free") as PlanCode;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  if (data.channel === "slack" && !limits.slackAlerts) {
    return NextResponse.json(
      { error: "Slack alerts require a Pro or Business plan." },
      { status: 403 }
    );
  }
  if (data.channel === "webhook" && !limits.export) {
    return NextResponse.json({ error: "Custom webhooks require a Business plan." }, { status: 403 });
  }
  if ((data.channel === "discord" || data.channel === "telegram") && !limits.slackAlerts) {
    return NextResponse.json({ error: `${data.channel} alerts require a Pro or Business plan.` }, { status: 403 });
  }

  // Validate webhook-style destinations are valid URLs
  if (["webhook", "discord"].includes(data.channel)) {
    try { new URL(data.destination); } catch {
      return NextResponse.json({ error: `${data.channel} destination must be a valid URL.` }, { status: 400 });
    }
  }
  // Validate Slack URL pattern
  if (data.channel === "slack" && !data.destination.startsWith("https://hooks.slack.com/")) {
    return NextResponse.json({ error: "Slack destination must be a hooks.slack.com URL." }, { status: 400 });
  }
  // Validate Discord URL pattern
  if (data.channel === "discord" && !data.destination.startsWith("https://discord.com/api/webhooks/")) {
    return NextResponse.json({ error: "Discord destination must be a discord.com webhook URL." }, { status: 400 });
  }

  try {
    // Verify monitor belongs to this org
    const [monitor] = await db.select().from(monitors)
      .where(and(eq(monitors.id, data.monitorId), eq(monitors.orgId, auth.org.id)))
      .limit(1);
    if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

    // Upsert: check if config exists for this monitor+channel
    const [existing] = await db.select().from(alertConfigs)
      .where(
        and(
          eq(alertConfigs.monitorId, data.monitorId),
          eq(alertConfigs.channel, data.channel),
          eq(alertConfigs.orgId, auth.org.id),
        )
      )
      .limit(1);

    let config;
    if (existing) {
      [config] = await db.update(alertConfigs)
        .set({
          destination: data.destination,
          minImportance: data.minImportance,
          isActive: data.isActive,
        })
        .where(eq(alertConfigs.id, existing.id))
        .returning();
    } else {
      [config] = await db.insert(alertConfigs)
        .values({
          monitorId: data.monitorId,
          orgId: auth.org.id,
          channel: data.channel,
          destination: data.destination,
          minImportance: data.minImportance,
          isActive: data.isActive,
        })
        .returning();
    }

    // Re-subscribe: if user enables email alerts, clear the org-level unsubscribe flag.
    // This is the ONLY way to re-enable emails after one-click unsubscribe.
    if (data.channel === "email" && data.isActive) {
      await db.update(organizations)
        .set({ emailUnsubscribedAt: null })
        .where(eq(organizations.id, auth.org.id));
    }

    const ip = request.headers.get("x-forwarded-for") || undefined;
    logActivity({
      orgId: auth.org.id,
      userEmail: auth.user.email,
      action: "alert.save",
      targetType: "alert_config",
      targetId: config.id,
      details: { channel: data.channel, monitorId: data.monitorId, isActive: data.isActive },
      ip,
    });

    return NextResponse.json({ config }, { status: existing ? 200 : 201 });
  } catch (err) {
    console.error("Failed to save alert config:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/alert-configs?id=...
export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed: deleteAllowed } = await rateLimit('alerts-delete:' + auth.user.id, 10, 60000);
  if (!deleteAllowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const configId = request.nextUrl.searchParams.get("id");
  if (!configId) return NextResponse.json({ error: "Missing config id" }, { status: 400 });

  try {
    const [deleted] = await db.delete(alertConfigs)
      .where(and(eq(alertConfigs.id, configId), eq(alertConfigs.orgId, auth.org.id)))
      .returning();

    if (!deleted) return NextResponse.json({ error: "Config not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete alert config:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
