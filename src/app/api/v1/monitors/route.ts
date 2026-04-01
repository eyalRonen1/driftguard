import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createMonitorSchema } from "@/lib/validators/monitor";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { fetchPage } from "@/lib/scan-engine/fetcher";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/v1/monitors - List all monitors
export async function GET() {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select()
    .from(monitors)
    .where(eq(monitors.orgId, auth.org.id))
    .orderBy(monitors.createdAt);

  return NextResponse.json({ monitors: result });
}

// POST /api/v1/monitors - Create a new monitor (rate limited)
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 20 monitor creations per hour
  const { allowed } = rateLimit(`create:${auth.user.id}`, 20, 3600000);
  if (!allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

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
      lastContentHash: preflight.hash,
      lastContentText: preflight.text,
      lastCheckedAt: new Date(),
      nextCheckAt: getNextCheckTime(data.checkFrequency),
    })
    .returning();

  return NextResponse.json({ monitor, contentPreview: preflight.text.slice(0, 500) }, { status: 201 });
}

function getNextCheckTime(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "15min": return new Date(now.getTime() + 15 * 60 * 1000);
    case "hourly": return new Date(now.getTime() + 60 * 60 * 1000);
    case "every_6h": return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    case "daily": return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}
