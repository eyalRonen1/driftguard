import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedOrg } from "@/lib/db/get-org";

export async function GET() {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const allChanges = await db.select({
      date: changes.createdAt,
      summary: changes.summary,
      changeType: changes.changeType,
      importance: changes.importanceScore,
      diffPercentage: changes.diffPercentage,
      addedText: changes.addedText,
      removedText: changes.removedText,
      monitorId: changes.monitorId,
    })
    .from(changes)
    .where(eq(changes.orgId, auth.org.id))
    .orderBy(desc(changes.createdAt))
    .limit(1000);

    // Fetch all monitors for this org to resolve names
    const orgMonitors = await db.select({
      id: monitors.id,
      name: monitors.name,
      url: monitors.url,
    })
    .from(monitors)
    .where(eq(monitors.orgId, auth.org.id));

    const monitorMap = new Map(orgMonitors.map(m => [m.id, m]));

    // Build CSV
    const headers = ["Date", "Monitor", "URL", "Summary", "Type", "Importance", "Diff %", "Added", "Removed"];
    const rows = allChanges.map(c => {
      const mon = monitorMap.get(c.monitorId);
      return [
        new Date(c.date).toISOString(),
        `"${(mon?.name || "Unknown").replace(/"/g, '""')}"`,
        `"${(mon?.url || "").replace(/"/g, '""')}"`,
        `"${(c.summary || "").replace(/"/g, '""')}"`,
        c.changeType,
        c.importance,
        c.diffPercentage || "0",
        `"${(c.addedText || "").replace(/"/g, '""').slice(0, 200)}"`,
        `"${(c.removedText || "").replace(/"/g, '""').slice(0, 200)}"`,
      ];
    });

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="all_changes_export.csv"`,
      },
    });
  } catch (err) {
    console.error("Export all changes failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
