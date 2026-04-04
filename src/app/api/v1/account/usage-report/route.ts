import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, monitors, changes, snapshots, users } from "@/lib/db/schema";
import { eq, and, count, sql, desc } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/v1/account/usage-report?orgId=...
 *
 * Generates a detailed usage report for an organization.
 * Used for: refund dispute evidence, admin analytics, customer support.
 *
 * Only accessible by the org owner (authenticated).
 * For admin: pass orgId as query param (requires the requesting user to own that org).
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await rateLimit(`usage-report:${auth.user.id}`, 5, 60000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const orgId = request.nextUrl.searchParams.get("orgId") || auth.org.id;

  // Verify the requesting user owns this org
  if (orgId !== auth.org.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get org info
    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
    if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

    // Get owner info
    const [owner] = await db.select({ email: users.email, name: users.name, createdAt: users.createdAt })
      .from(users).where(eq(users.id, org.ownerId)).limit(1);

    // Get all monitors for this org
    const orgMonitors = await db.select({
      id: monitors.id,
      name: monitors.name,
      url: monitors.url,
      createdAt: monitors.createdAt,
      totalChecks: monitors.totalChecks,
      totalChanges: monitors.totalChanges,
      manualCheckCount: monitors.manualCheckCount,
      isActive: monitors.isActive,
      lastCheckedAt: monitors.lastCheckedAt,
      checkFrequency: monitors.checkFrequency,
    }).from(monitors).where(eq(monitors.orgId, orgId)).orderBy(monitors.createdAt);

    // Get total changes count
    const [changesCount] = await db.select({ count: count() }).from(changes).where(eq(changes.orgId, orgId));

    // Get total snapshots count
    const monitorIds = orgMonitors.map(m => m.id);
    let snapshotsCount = 0;
    if (monitorIds.length > 0) {
      const [sc] = await db.select({ count: count() }).from(snapshots)
        .where(sql`${snapshots.monitorId} IN (${sql.join(monitorIds.map(id => sql`${id}`), sql`, `)})`);
      snapshotsCount = sc?.count || 0;
    }

    // Get recent changes (last 20)
    const recentChanges = await db.select({
      id: changes.id,
      monitorId: changes.monitorId,
      summary: changes.summary,
      changeType: changes.changeType,
      importanceScore: changes.importanceScore,
      createdAt: changes.createdAt,
    }).from(changes).where(eq(changes.orgId, orgId)).orderBy(desc(changes.createdAt)).limit(20);

    // Build report
    const report = {
      generatedAt: new Date().toISOString(),
      organization: {
        id: org.id,
        name: org.name,
        plan: org.plan,
        createdAt: org.createdAt,
        monthlyChecksUsed: org.monthlyChecksUsed,
        monthlyCheckQuota: org.monthlyCheckQuota,
        paddleSubscriptionId: org.paddleSubscriptionId,
        paddleSubscriptionStatus: org.paddleSubscriptionStatus,
      },
      owner: {
        email: owner?.email,
        name: owner?.name,
        accountCreatedAt: owner?.createdAt,
      },
      usage: {
        totalMonitors: orgMonitors.length,
        activeMonitors: orgMonitors.filter(m => m.isActive).length,
        totalChecksAllTime: orgMonitors.reduce((sum, m) => sum + (m.totalChecks || 0), 0),
        totalManualChecks: orgMonitors.reduce((sum, m) => sum + (m.manualCheckCount || 0), 0),
        totalChangesDetected: changesCount?.count || 0,
        totalSnapshots: snapshotsCount,
        checksThisMonth: org.monthlyChecksUsed,
      },
      monitors: orgMonitors.map(m => ({
        name: m.name,
        url: m.url,
        createdAt: m.createdAt,
        frequency: m.checkFrequency,
        totalChecks: m.totalChecks,
        totalChanges: m.totalChanges,
        manualChecks: m.manualCheckCount,
        active: m.isActive,
        lastChecked: m.lastCheckedAt,
      })),
      recentActivity: recentChanges.map(c => ({
        date: c.createdAt,
        monitorId: c.monitorId,
        summary: c.summary,
        type: c.changeType,
        importance: c.importanceScore,
      })),
      disclaimer: "This report was generated automatically by Zikit (zikit.ai) and represents actual usage data from our production database. All timestamps are in UTC.",
    };

    return NextResponse.json(report);
  } catch (err) {
    console.error("Failed to generate usage report:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
