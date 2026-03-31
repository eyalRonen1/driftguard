import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { checkMonitor } from "@/lib/scan-engine/checker";

// POST /api/v1/monitors/[monitorId]/check - Run a manual check
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const [monitor] = await db
    .select()
    .from(monitors)
    .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
    .limit(1);

  if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

  const result = await checkMonitor(monitorId);

  return NextResponse.json({ result }, { status: 200 });
}
