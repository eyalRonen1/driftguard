import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const [monitor] = await db.select()
    .from(monitors)
    .where(and(eq(monitors.id, monitorId), eq(monitors.orgId, auth.org.id)))
    .limit(1);

  if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

  try {
    const allChanges = await db.select({
      date: changes.createdAt,
      summary: changes.summary,
      changeType: changes.changeType,
      importance: changes.importanceScore,
      diffPercentage: changes.diffPercentage,
      addedText: changes.addedText,
      removedText: changes.removedText,
    })
    .from(changes)
    .where(eq(changes.monitorId, monitorId))
    .orderBy(desc(changes.createdAt))
    .limit(500);

    // Build CSV
    const headers = ["Date", "Summary", "Type", "Importance", "Diff %", "Added", "Removed"];
    const rows = allChanges.map(c => [
      new Date(c.date).toISOString(),
      `"${(c.summary || "").replace(/"/g, '""')}"`,
      c.changeType,
      c.importance,
      c.diffPercentage || "0",
      `"${(c.addedText || "").replace(/"/g, '""').slice(0, 200)}"`,
      `"${(c.removedText || "").replace(/"/g, '""').slice(0, 200)}"`,
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${monitor.name.replace(/[^a-zA-Z0-9]/g, "_")}_changes.csv"`,
      },
    });
  } catch (err) {
    console.error("Export failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
