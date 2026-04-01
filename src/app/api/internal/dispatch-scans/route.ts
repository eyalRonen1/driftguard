/**
 * Cron endpoint - dispatches scheduled page checks.
 * Called by Vercel Cron daily (Hobby plan).
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors } from "@/lib/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { checkMonitor } from "@/lib/scan-engine/checker";
import { timingSafeEqual } from "crypto";
import { getNextCheckTime } from "@/lib/utils/check-schedule";

export async function GET(request: Request) {
  // Verify cron secret - fail closed: ALWAYS require CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured, rejecting request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find monitors due for checking - only select needed columns (avoid loading lastContentText)
  const dueMonitors = await db
    .select({ id: monitors.id, checkFrequency: monitors.checkFrequency })
    .from(monitors)
    .where(
      and(
        eq(monitors.isActive, true),
        eq(monitors.isPaused, false),
        lte(monitors.nextCheckAt, now)
      )
    )
    .limit(50);

  // Process monitors in batches of 5 for controlled concurrency
  const BATCH_SIZE = 5;
  let checkedCount = 0;
  let changesCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dueMonitors.length; i += BATCH_SIZE) {
    const batch = dueMonitors.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (monitor) => {
        // Set next check time immediately to prevent double-dispatch
        await db
          .update(monitors)
          .set({ nextCheckAt: getNextCheckTime(monitor.checkFrequency) })
          .where(eq(monitors.id, monitor.id));
        return checkMonitor(monitor.id);
      })
    );

    for (const r of batchResults) {
      checkedCount++;
      if (r.status === "fulfilled") {
        if (r.value.changed) changesCount++;
        if (r.value.error) errorCount++;
      } else {
        errorCount++;
        console.error("Monitor check failed:", r.reason);
      }
    }
  }

  // Sanitized response: counts only, no internal error messages
  return NextResponse.json({
    checked: checkedCount,
    changesDetected: changesCount,
    errors: errorCount,
    timestamp: now.toISOString(),
  });
}
