import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { updateMonitorSchema } from "@/lib/validators/monitor";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { getAuthenticatedOrgFromApiKey } from "@/lib/db/get-org-api-key";
import { rateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS, type PlanCode } from "@/lib/billing/paddle";
import { isValidUuid } from "@/lib/validators/uuid";
import { logActivity } from "@/lib/activity-log";

// GET /api/v1/monitors/[monitorId] - Get monitor with recent changes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  if (!isValidUuid(monitorId)) return NextResponse.json({ error: "Invalid monitor ID" }, { status: 400 });
  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await rateLimit(`read:${auth.user.id}`, 60, 60000);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  try {
    const [monitor] = await db
      .select()
      .from(monitors)
      .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
      .limit(1);

    if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

    // Get recent changes (scoped to org for tenant isolation)
    const recentChanges = await db
      .select()
      .from(changes)
      .where(and(eq(changes.monitorId, monitorId), eq(changes.orgId, auth.org.id)))
      .orderBy(desc(changes.createdAt))
      .limit(20);

    return NextResponse.json({
      monitor,
      changes: recentChanges,
      plan: auth.org.plan || "free",
      userEmail: auth.user.email,
      emailUnsubscribedAt: auth.org.emailUnsubscribedAt || null,
      timezone: auth.org.timezone || "UTC",
    });
  } catch (err) {
    console.error("Failed to fetch monitor:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/v1/monitors/[monitorId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  if (!isValidUuid(monitorId)) return NextResponse.json({ error: "Invalid monitor ID" }, { status: 400 });
  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed: patchAllowed } = await rateLimit(`update:${auth.user.id}`, 20, 60000);
  if (!patchAllowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateMonitorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  // Plan-based feature gating on update
  const plan = (auth.org.plan || "free") as PlanCode;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  if (parsed.data.checkFrequency) {
    const allowed: readonly string[] = limits.checkFrequency;
    if (!allowed.includes(parsed.data.checkFrequency)) {
      return NextResponse.json(
        { error: `Check frequency "${parsed.data.checkFrequency}" is not available on your ${plan} plan. Upgrade to unlock it.` },
        { status: 403 }
      );
    }
  }

  if (parsed.data.cssSelector && !limits.cssSelector) {
    return NextResponse.json(
      { error: "CSS selectors require a Pro or Business plan." },
      { status: 403 }
    );
  }

  try {
    const [monitor] = await db
      .update(monitors)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
      .returning();

    if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

    const ip = request.headers.get("x-forwarded-for") || undefined;
    logActivity({
      orgId: auth.org.id,
      userEmail: auth.user.email,
      action: "monitor.update",
      targetType: "monitor",
      targetId: monitor.id,
      targetName: monitor.name,
      details: parsed.data,
      ip,
    });

    return NextResponse.json({ monitor });
  } catch (err) {
    console.error("Failed to update monitor:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/monitors/[monitorId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  if (!isValidUuid(monitorId)) return NextResponse.json({ error: "Invalid monitor ID" }, { status: 400 });
  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed: delAllowed } = await rateLimit(`delete-monitor:${auth.user.id}`, 10, 60000);
  if (!delAllowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  try {
    const [monitor] = await db
      .delete(monitors)
      .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
      .returning();

    if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

    logActivity({
      orgId: auth.org.id,
      userEmail: auth.user.email,
      action: "monitor.delete",
      targetType: "monitor",
      targetId: monitor.id,
      targetName: monitor.name,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete monitor:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
