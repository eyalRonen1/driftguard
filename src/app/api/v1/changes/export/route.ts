import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { getAuthenticatedOrgFromApiKey } from "@/lib/db/get-org-api-key";
import { rateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS, type PlanCode } from "@/lib/billing/paddle";

/** Clean text for CSV — strip HTML, normalize whitespace, escape quotes */
function cleanText(text: string | null | undefined, maxLen = 300): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "")         // strip HTML tags
    .replace(/&[a-z]+;/gi, " ")      // strip HTML entities
    .replace(/[\r\n\t]+/g, " ")      // normalize whitespace
    .replace(/\s+/g, " ")            // collapse multiple spaces
    .trim()
    .slice(0, maxLen);
}

/** Escape a CSV field — wrap in quotes, escape internal quotes */
function csvField(value: string | number | null | undefined): string {
  if (value == null) return '""';
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedOrg() ?? await getAuthenticatedOrgFromApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = (auth.org.plan || "free") as PlanCode;
  if (!(PLAN_LIMITS[plan] || PLAN_LIMITS.free).export) {
    return NextResponse.json({ error: "Export requires a Pro or Business plan." }, { status: 403 });
  }

  const { allowed } = await rateLimit("export-all:" + auth.user.id, 5, 60000);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

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
        monitorId: changes.monitorId,
      })
      .from(changes)
      .where(eq(changes.orgId, auth.org.id))
      .orderBy(desc(changes.createdAt))
      .limit(1000);

    const orgMonitors = await db
      .select({ id: monitors.id, name: monitors.name, url: monitors.url })
      .from(monitors)
      .where(eq(monitors.orgId, auth.org.id));

    const monitorMap = new Map(orgMonitors.map((m) => [m.id, m]));

    const headers = ["Date", "Monitor", "URL", "Summary", "Details", "Action Item", "Type", "Importance", "Diff %", "Tags", "Added", "Removed"];

    const rows = allChanges.map((c) => {
      const mon = monitorMap.get(c.monitorId);
      return [
        csvField(c.date ? new Date(c.date).toISOString() : ""),
        csvField(mon?.name || "Unknown"),
        csvField(mon?.url || ""),
        csvField(cleanText(c.summary, 500)),
        csvField(cleanText(c.details, 500)),
        csvField(cleanText(c.actionItem, 200)),
        csvField(c.changeType),
        csvField(c.importance),
        csvField(c.diffPercentage ? `${c.diffPercentage}%` : "0%"),
        csvField(c.tags || ""),
        csvField(cleanText(c.addedText, 200)),
        csvField(cleanText(c.removedText, 200)),
      ].join(",");
    });

    // UTF-8 BOM so Excel displays Hebrew/Unicode correctly
    const BOM = "\uFEFF";
    const csv = BOM + [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zikit-changes-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("Export all changes failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
