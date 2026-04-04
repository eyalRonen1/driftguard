import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { getAuthenticatedOrgFromApiKey } from "@/lib/db/get-org-api-key";
import { rateLimit } from "@/lib/rate-limit";
import { isValidUuid } from "@/lib/validators/uuid";

// GET /api/v1/monitors/[monitorId]/changes - List changes as JSON
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  if (!isValidUuid(monitorId)) return NextResponse.json({ error: "Invalid monitor ID" }, { status: 400 });

  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await rateLimit(`changes:${auth.user.id}`, 60, 60000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // Verify monitor belongs to this org
  const [monitor] = await db.select({ id: monitors.id })
    .from(monitors)
    .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
    .limit(1);

  if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

  // Parse query params
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 20, 100);

  const result = await db.select({
    id: changes.id,
    summary: changes.summary,
    changeType: changes.changeType,
    importanceScore: changes.importanceScore,
    addedText: changes.addedText,
    removedText: changes.removedText,
    details: changes.details,
    actionItem: changes.actionItem,
    focusedDiffBefore: changes.focusedDiffBefore,
    focusedDiffAfter: changes.focusedDiffAfter,
    tags: changes.tags,
    keywordMatched: changes.keywordMatched,
    createdAt: changes.createdAt,
  })
    .from(changes)
    .where(and(eq(changes.monitorId, monitorId), eq(changes.orgId, auth.org.id)))
    .orderBy(desc(changes.createdAt))
    .limit(limit);

  return NextResponse.json({ changes: result, count: result.length });
}
