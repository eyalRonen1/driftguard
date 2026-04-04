/**
 * Cron endpoint - dispatches scheduled page checks.
 * Called by Vercel Cron daily (Hobby plan).
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitors, changes, snapshots, organizations } from "@/lib/db/schema";
import { and, eq, lte, sql } from "drizzle-orm";
import { checkMonitor } from "@/lib/scan-engine/checker";
import { timingSafeEqual } from "crypto";
import { getNextCheckTime } from "@/lib/utils/check-schedule";

const RETENTION_DAYS: Record<string, number> = { free: 7, pro: 90, business: 365 };

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

  // Atomically claim monitors due for checking — prevents double-dispatch race condition.
  // The WHERE includes nextCheckAt <= now, and SET advances it immediately in one statement.
  // A concurrent cron invocation will see the updated nextCheckAt and skip these monitors.
  const dueMonitors = await db
    .select({
      id: monitors.id,
      checkFrequency: monitors.checkFrequency,
      preferredCheckHour: monitors.preferredCheckHour,
      preferredCheckDay: monitors.preferredCheckDay,
    })
    .from(monitors)
    .where(
      and(
        eq(monitors.isActive, true),
        eq(monitors.isPaused, false),
        lte(monitors.nextCheckAt, now)
      )
    )
    .limit(50);

  // Claim all due monitors atomically by advancing their nextCheckAt
  for (const m of dueMonitors) {
    await db
      .update(monitors)
      .set({ nextCheckAt: getNextCheckTime(m.checkFrequency, m.preferredCheckHour, m.preferredCheckDay) })
      .where(and(eq(monitors.id, m.id), lte(monitors.nextCheckAt, now)));
  }

  // Process monitors in batches of 5 for controlled concurrency
  const BATCH_SIZE = 5;
  let checkedCount = 0;
  let changesCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dueMonitors.length; i += BATCH_SIZE) {
    const batch = dueMonitors.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (monitor) => {
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

  // ==========================================
  // History retention cleanup — one query per plan tier (not N+1)
  // ==========================================
  let cleanedChanges = 0;
  let cleanedSnapshots = 0;
  try {
    for (const [plan, days] of Object.entries(RETENTION_DAYS)) {
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      // Single SQL: delete changes for monitors in orgs of this plan tier
      const deletedC = await db.execute(sql`
        DELETE FROM changes WHERE created_at < ${cutoff}
        AND monitor_id IN (
          SELECT m.id FROM monitors m
          JOIN organizations o ON m.org_id = o.id
          WHERE o.plan = ${plan}
        )
      `);
      const deletedS = await db.execute(sql`
        DELETE FROM snapshots WHERE captured_at < ${cutoff}
        AND monitor_id IN (
          SELECT m.id FROM monitors m
          JOIN organizations o ON m.org_id = o.id
          WHERE o.plan = ${plan}
        )
      `);
      cleanedChanges += Number((deletedC as any)?.rowCount || 0);
      cleanedSnapshots += Number((deletedS as any)?.rowCount || 0);
    }
  } catch (err) {
    console.error("Retention cleanup error:", err);
  }

  // Sanitized response: counts only, no internal error messages
  return NextResponse.json({
    checked: checkedCount,
    changesDetected: changesCount,
    errors: errorCount,
    cleaned: { changes: cleanedChanges, snapshots: cleanedSnapshots },
    timestamp: now.toISOString(),
  });
}
