/**
 * Page Checker - Orchestrates the full check cycle for a monitor.
 * Fetch → Compare → Summarize → Store → Alert
 */

import { db } from "@/lib/db";
import { monitors, snapshots, changes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchPage } from "./fetcher";
import { summarizeChange } from "./summarizer";
import { filterNoise, calculateSignalScore, shouldAlert } from "./noise-filter";

export interface CheckResult {
  monitorId: string;
  changed: boolean;
  summary: string | null;
  importanceScore: number | null;
  error: string | null;
}

/**
 * Run a check for a single monitor
 */
export async function checkMonitor(monitorId: string): Promise<CheckResult> {
  // Fetch monitor config
  const [monitor] = await db
    .select()
    .from(monitors)
    .where(eq(monitors.id, monitorId))
    .limit(1);

  if (!monitor) {
    return { monitorId, changed: false, summary: null, importanceScore: null, error: "Monitor not found" };
  }

  // Fetch the page
  const result = await fetchPage(monitor.url, {
    cssSelector: monitor.cssSelector,
    ignoreSelectors: monitor.ignoreSelectors,
    headers: monitor.headers as Record<string, string> | null,
  });

  // Update last checked time
  const now = new Date();

  if (result.error) {
    const errors = monitor.consecutiveErrors + 1;
    const healthStatus = errors >= 3 ? "error" : errors >= 2 ? "unstable" : "healthy";
    const healthReason = errors >= 3
      ? `Page unreachable for ${errors} consecutive checks: ${result.error}`
      : errors >= 2
      ? `Page returned errors ${errors} times: ${result.error}`
      : null;

    await db
      .update(monitors)
      .set({
        lastCheckedAt: now,
        consecutiveErrors: errors,
        lastError: result.error,
        healthStatus,
        healthReason,
        healthCheckedAt: now,
        updatedAt: now,
      })
      .where(eq(monitors.id, monitorId));

    return { monitorId, changed: false, summary: null, importanceScore: null, error: result.error };
  }

  // Store snapshot
  const [snapshot] = await db
    .insert(snapshots)
    .values({
      monitorId,
      contentText: result.text,
      contentHash: result.hash,
      contentLength: result.contentLength,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
    })
    .returning();

  // Compare with previous content using noise filtering
  const previousRaw = monitor.lastContentText || "";
  const filteredBefore = filterNoise(previousRaw);
  const filteredAfter = filterNoise(result.text);
  const signalScore = calculateSignalScore(previousRaw, result.text, filteredBefore, filteredAfter);

  // Only count as changed if content hash changed AND signal is meaningful
  const hasChanged = monitor.lastContentHash !== null && monitor.lastContentHash !== result.hash && signalScore > 0;

  if (!hasChanged) {
    // No change - just update the monitor
    await db
      .update(monitors)
      .set({
        lastContentHash: result.hash,
        lastContentText: result.text,
        lastCheckedAt: now,
        consecutiveErrors: 0,
        lastError: null,
        healthStatus: "healthy",
        healthReason: null,
        healthCheckedAt: now,
        lastHealthyAt: now,
        updatedAt: now,
      })
      .where(eq(monitors.id, monitorId));

    return { monitorId, changed: false, summary: null, importanceScore: null, error: null };
  }

  // Change detected! Generate AI summary
  const previousText = monitor.lastContentText || "";
  const summaryResult = await summarizeChange(previousText, result.text, monitor.url);

  // Find the previous snapshot for reference
  const previousSnapshots = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.monitorId, monitorId))
    .orderBy(snapshots.capturedAt)
    .limit(2);

  const beforeSnapshotId = previousSnapshots.length > 1 ? previousSnapshots[previousSnapshots.length - 2].id : null;

  // Calculate diff percentage
  const maxLen = Math.max(previousText.length, result.text.length);
  const diffChars = Math.abs(previousText.length - result.text.length);
  const diffPercentage = maxLen > 0 ? ((diffChars / maxLen) * 100).toFixed(2) : "0";

  // Compute simple text diff (what was added/removed)
  const beforeSentences = new Set(previousText.split(/[.!?]\s+/).map(s => s.trim().toLowerCase()).filter(Boolean));
  const afterSentences = new Set(result.text.split(/[.!?]\s+/).map(s => s.trim().toLowerCase()).filter(Boolean));

  const added = result.text.split(/[.!?]\s+/).filter(s => s.trim() && !beforeSentences.has(s.trim().toLowerCase()));
  const removed = previousText.split(/[.!?]\s+/).filter(s => s.trim() && !afterSentences.has(s.trim().toLowerCase()));

  const addedText = added.slice(0, 5).join(". ").slice(0, 500) || null;
  const removedText = removed.slice(0, 5).join(". ").slice(0, 500) || null;

  // Store the change
  await db.insert(changes).values({
    monitorId,
    orgId: monitor.orgId,
    snapshotBeforeId: beforeSnapshotId,
    snapshotAfterId: snapshot.id,
    summary: summaryResult.summary,
    summaryModel: summaryResult.model,
    changeType: summaryResult.changeType,
    importanceScore: summaryResult.importanceScore,
    addedText,
    removedText,
    diffPercentage,
  });

  // Update monitor
  await db
    .update(monitors)
    .set({
      lastContentHash: result.hash,
      lastContentText: result.text,
      lastCheckedAt: now,
      consecutiveErrors: 0,
      lastError: null,
      healthStatus: "healthy",
      healthReason: null,
      healthCheckedAt: now,
      lastHealthyAt: now,
      updatedAt: now,
    })
    .where(eq(monitors.id, monitorId));

  return {
    monitorId,
    changed: true,
    summary: summaryResult.summary,
    importanceScore: summaryResult.importanceScore,
    error: null,
  };
}
