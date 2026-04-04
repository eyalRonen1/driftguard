import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedOrgFromApiKey } from "@/lib/db/get-org-api-key";
import { db } from "@/lib/db";
import { changes } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

/** GET - Count changes since the extension last checked (truly unread) */
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { allowed } = await rateLimit(`badge:${auth.org.id}`, 30, 60000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // Use the "last seen" timestamp from query param, or fallback to 1 hour
  const lastSeenParam = request.nextUrl.searchParams.get("since");
  const since = lastSeenParam ? new Date(lastSeenParam) : new Date(Date.now() - 60 * 60 * 1000);

  // Only count changes with importance >= 3 (skip trivial noise)
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(changes)
    .where(and(
      eq(changes.orgId, auth.org.id),
      gte(changes.createdAt, since),
      gte(changes.importanceScore, 3),
    ));

  return NextResponse.json({
    unreadChanges: result?.count || 0,
    since: since.toISOString(),
  });
}
