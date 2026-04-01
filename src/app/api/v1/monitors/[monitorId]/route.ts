import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { updateMonitorSchema } from "@/lib/validators/monitor";
import { getAuthenticatedOrg } from "@/lib/db/get-org";

// GET /api/v1/monitors/[monitorId] - Get monitor with recent changes
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({ monitor, changes: recentChanges });
}

// PATCH /api/v1/monitors/[monitorId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateMonitorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const [monitor] = await db
    .update(monitors)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
    .returning();

  if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  return NextResponse.json({ monitor });
}

// DELETE /api/v1/monitors/[monitorId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [monitor] = await db
    .delete(monitors)
    .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
    .returning();

  if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
