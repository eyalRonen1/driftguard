import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, snapshots } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createMonitorSchema } from "@/lib/validators/monitor";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { fetchPage } from "@/lib/scan-engine/fetcher";
import { rateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS, type PlanCode } from "@/lib/billing/paddle";
import { getNextCheckTime } from "@/lib/utils/check-schedule";

// GET /api/v1/monitors - List all monitors
export async function GET() {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await db
      .select()
      .from(monitors)
      .where(eq(monitors.orgId, auth.org.id))
      .orderBy(monitors.createdAt);

    return NextResponse.json({ monitors: result });
  } catch (err) {
    console.error("Failed to fetch monitors:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/monitors - Create a new monitor (rate limited)
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 20 monitor creations per hour
  const { allowed } = await rateLimit(`create:${auth.user.id}`, 20, 3600000);
  if (!allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  // Enforce plan-based monitor limits
  const plan = (auth.org.plan || "free") as PlanCode;
  const monitorLimit = PLAN_LIMITS[plan]?.monitors ?? PLAN_LIMITS.free.monitors;
  const [{ count: monitorCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(monitors)
    .where(eq(monitors.orgId, auth.org.id));

  if (monitorCount >= monitorLimit) {
    return NextResponse.json(
      { error: "Monitor limit reached for your plan. Upgrade to add more." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createMonitorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Enforce check frequency by plan
  const allowedFrequencies: readonly string[] = PLAN_LIMITS[plan]?.checkFrequency || PLAN_LIMITS.free.checkFrequency;
  if (!allowedFrequencies.includes(data.checkFrequency)) {
    return NextResponse.json(
      { error: `Check frequency "${data.checkFrequency}" is not available on your plan. Allowed: ${allowedFrequencies.join(", ")}` },
      { status: 403 }
    );
  }

  // Preflight check: verify URL is accessible
  const preflight = await fetchPage(data.url, { cssSelector: data.cssSelector, timeoutMs: 10000 });
  if (preflight.error) {
    return NextResponse.json(
      { error: `Cannot reach URL: ${preflight.error}`, preflight: false },
      { status: 422 }
    );
  }

  // Create monitor with initial content
  const [monitor] = await db
    .insert(monitors)
    .values({
      orgId: auth.org.id,
      name: data.name,
      url: data.url,
      checkFrequency: data.checkFrequency,
      cssSelector: data.cssSelector ?? null,
      ignoreSelectors: data.ignoreSelectors ?? null,
      headers: data.headers ?? {},
      description: data.description ?? null,
      tags: data.tags ?? null,
      useCase: data.useCase ?? null,
      watchKeywords: data.watchKeywords ?? null,
      keywordMode: data.keywordMode ?? "any",
      lastContentHash: preflight.hash,
      lastContentText: preflight.text,
      lastCheckedAt: new Date(),
      nextCheckAt: getNextCheckTime(data.checkFrequency),
    })
    .returning();

  // Create baseline snapshot so the first check has a reference point
  if (preflight.text) {
    await db.insert(snapshots).values({
      monitorId: monitor.id,
      contentText: preflight.text,
      contentHash: preflight.hash,
      contentLength: preflight.contentLength,
      statusCode: preflight.statusCode,
      responseTimeMs: preflight.responseTimeMs,
    });
  }

  return NextResponse.json({ monitor, contentPreview: preflight.text.slice(0, 500) }, { status: 201 });
}

