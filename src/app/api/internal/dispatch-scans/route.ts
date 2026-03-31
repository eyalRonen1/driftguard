/**
 * Cron endpoint - dispatches scheduled scans.
 * Called by Vercel Cron every 5 minutes.
 * Finds all chatbots due for scanning and executes them.
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatbots } from "@/lib/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { executeScan } from "@/lib/scan-engine/executor";

// Verify this is called by Vercel Cron (not public)
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // No secret configured = allow (dev mode)
  return authHeader === `Bearer ${cronSecret}`;
}

// Calculate next scan time based on frequency
function getNextScanTime(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "hourly":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "every_6h":
      return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find chatbots due for scanning
  const dueBots = await db
    .select()
    .from(chatbots)
    .where(
      and(
        eq(chatbots.isActive, true),
        lte(chatbots.nextScanAt, now)
      )
    )
    .limit(20); // Process max 20 per cron tick

  const results = [];

  for (const bot of dueBots) {
    try {
      // Update next scan time immediately to prevent double-dispatch
      await db
        .update(chatbots)
        .set({ nextScanAt: getNextScanTime(bot.scanFrequency) })
        .where(eq(chatbots.id, bot.id));

      const scanResult = await executeScan(bot.id, bot.orgId, "scheduled");
      results.push({ botId: bot.id, status: "completed", healthScore: scanResult.healthScore });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ botId: bot.id, status: "error", error: message });
    }
  }

  return NextResponse.json({
    dispatched: dueBots.length,
    results,
    timestamp: now.toISOString(),
  });
}
