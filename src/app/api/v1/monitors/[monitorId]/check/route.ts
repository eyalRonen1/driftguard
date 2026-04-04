import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { getAuthenticatedOrgFromApiKey } from "@/lib/db/get-org-api-key";
import { checkMonitor } from "@/lib/scan-engine/checker";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity-log";

// POST /api/v1/monitors/[monitorId]/check - Run a manual check
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "You need to be logged in to run a check. Please sign in and try again." }, { status: 401 });

  // Rate limit: 10 manual checks per hour per user
  const { allowed } = await rateLimit(`check:${auth.user.id}`, 10, 3600000);
  if (!allowed) return NextResponse.json({ error: "You've run too many manual checks this hour. Please wait a few minutes and try again." }, { status: 429 });

  // Verify ownership
  const [monitor] = await db
    .select()
    .from(monitors)
    .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
    .limit(1);

  if (!monitor) return NextResponse.json({ error: "This monitor was not found. It may have been deleted." }, { status: 404 });

  try {
    // Increment manual check count
    await db.update(monitors)
      .set({ manualCheckCount: sql`manual_check_count + 1` })
      .where(eq(monitors.id, monitorId));

    const result = await checkMonitor(monitorId);

    logActivity({
      orgId: auth.org.id,
      userEmail: auth.user.email,
      action: "monitor.check",
      targetType: "monitor",
      targetId: monitorId,
      targetName: monitor.name,
    });

    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    console.error("Failed to check monitor:", err);
    return NextResponse.json({ error: "Something went wrong on our end. Please try again in a moment." }, { status: 500 });
  }
}
