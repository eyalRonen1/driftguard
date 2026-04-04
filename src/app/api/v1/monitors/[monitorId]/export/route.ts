import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { getAuthenticatedOrgFromApiKey } from "@/lib/db/get-org-api-key";
import { rateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS, type PlanCode } from "@/lib/billing/paddle";

function cleanText(text: string | null | undefined, maxLen = 300): string {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLen);
}

function csvField(value: string | number | null | undefined): string {
  if (value == null) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = (auth.org.plan || "free") as PlanCode;
  if (!(PLAN_LIMITS[plan] || PLAN_LIMITS.free).export) {
    return NextResponse.json({ error: "Export requires a Pro or Business plan." }, { status: 403 });
  }

  const { allowed } = await rateLimit("export:" + auth.user.id, 5, 60000);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const [monitor] = await db
    .select()
    .from(monitors)
    .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
    .limit(1);

  if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

  try {
    const allChanges = await db
      .select({
        date: changes.createdAt,
        summary: changes.summary,
        details: changes.details,
        actionItem: changes.actionItem,
        changeType: changes.changeType,
        importance: changes.importanceScore,
        diffPercentage: changes.diffPercentage,
        tags: changes.tags,
        addedText: changes.addedText,
        removedText: changes.removedText,
      })
      .from(changes)
      .where(eq(changes.monitorId, monitorId))
      .orderBy(desc(changes.createdAt))
      .limit(500);

    const headers = ["Date", "Summary", "Details", "Action Item", "Type", "Importance", "Diff %", "Tags", "Added", "Removed"];

    const rows = allChanges.map((c) =>
      [
        csvField(c.date ? new Date(c.date).toISOString() : ""),
        csvField(cleanText(c.summary, 500)),
        csvField(cleanText(c.details, 500)),
        csvField(cleanText(c.actionItem, 200)),
        csvField(c.changeType),
        csvField(c.importance),
        csvField(c.diffPercentage ? `${c.diffPercentage}%` : "0%"),
        csvField(c.tags || ""),
        csvField(cleanText(c.addedText, 200)),
        csvField(cleanText(c.removedText, 200)),
      ].join(",")
    );

    const safeName = monitor.name.replace(/[^a-zA-Z0-9_\- ]/g, "").slice(0, 50) || "monitor";
    const BOM = "\uFEFF";
    const csv = BOM + [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}-changes-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("Export failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
