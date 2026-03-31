/**
 * Cron endpoint - dispatches scheduled page checks.
 * Called by Vercel Cron daily (Hobby plan).
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { checkMonitor } from "@/lib/scan-engine/checker";

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

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find monitors due for checking
  const dueMonitors = await db
    .select()
    .from(monitors)
    .where(
      and(
        eq(monitors.isActive, true),
        eq(monitors.isPaused, false),
        lte(monitors.nextCheckAt, now)
      )
    )
    .limit(50);

  const results = [];

  for (const monitor of dueMonitors) {
    try {
      // Set next check time immediately to prevent double-dispatch
      await db
        .update(monitors)
        .set({ nextCheckAt: getNextCheckTime(monitor.checkFrequency) })
        .where(eq(monitors.id, monitor.id));

      const result = await checkMonitor(monitor.id);
      results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ monitorId: monitor.id, changed: false, error: message });
    }
  }

  return NextResponse.json({
    checked: dueMonitors.length,
    changesDetected: results.filter((r) => r.changed).length,
    errors: results.filter((r) => r.error).length,
    timestamp: now.toISOString(),
  });
}
