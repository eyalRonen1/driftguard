/**
 * Page Checker - Orchestrates the full check cycle for a monitor.
 * Fetch → Structured Extract → Noise Filter → Semantic Gate → Compare → Summarize → Store → Alert
 *
 * Advanced pipeline:
 * 1. Fetch page (HTML + text)
 * 2. Extract structured content (sections, prices, page type)
 * 3. Filter noise (timestamps, tokens, counters)
 * 4. Semantic gate (embeddings check — skip LLM if change is cosmetic)
 * 5. Confidence scorer (composite importance from all signals)
 * 6. LLM summarizer (only when semantic gate says run_llm)
 * 7. Store change + update monitor
 */

import { db } from "@/lib/db";
import { monitors, snapshots, changes, organizations, alertConfigs } from "@/lib/db/schema";
import { eq, or, isNull, sql, desc } from "drizzle-orm";
import { smartFetch } from "./fetcher";
import { summarizeChange } from "./summarizer";
import { filterNoise, calculateSignalScore } from "./noise-filter";
import { extractStructuredContent } from "./structured-extractor";
import { semanticGate } from "./semantic-gate";
import { sendChangeAlert, sendSlackChangeAlert, sendWebhookAlert, sendDiscordAlert, sendTelegramAlert } from "@/lib/notifications/email";

// ── Error Classification ────────────────────────────────────────────

function classifyError(statusCode: number, errorMsg: string, url: string): { healthReason: string; userMessage: string } {
  // Bot protection / Firewall
  if (statusCode === 403 || errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
    let hostname = url;
    try { hostname = new URL(url).hostname; } catch {}
    return {
      healthReason: `This site (${hostname}) blocks automated monitoring. It uses bot protection (like Cloudflare) that only allows real browsers.`,
      userMessage: "This site has bot protection that blocks our servers. We're working on Smart Browser support to handle this. In the meantime, try monitoring a different page on the same site, or check if the site has an RSS feed or API."
    };
  }

  // Rate limited
  if (statusCode === 429) {
    return {
      healthReason: "The site is rate-limiting our requests. We'll try again at the next scheduled check with a longer delay.",
      userMessage: "This site is temporarily limiting our access. Camo will retry automatically — no action needed."
    };
  }

  // Server error
  if (statusCode >= 500) {
    return {
      healthReason: `The site returned a server error (${statusCode}). This is usually temporary.`,
      userMessage: "The site itself is having issues (server error). Camo will keep trying — this usually resolves on its own."
    };
  }

  // Not found
  if (statusCode === 404) {
    return {
      healthReason: "This page no longer exists (404). It may have been moved or deleted.",
      userMessage: "This page was not found (404). It might have been moved or deleted. Check if the URL is still correct."
    };
  }

  // Timeout
  if (errorMsg.includes("Timeout") || errorMsg.includes("timeout") || errorMsg.includes("AbortError")) {
    return {
      healthReason: "The page took too long to respond. This could be a slow server or a very large page.",
      userMessage: "This page is taking too long to load. It might be a slow server or a very heavy page. Camo will retry."
    };
  }

  // DNS / Connection error
  if (errorMsg.includes("ENOTFOUND") || errorMsg.includes("resolve")) {
    return {
      healthReason: "Could not find this website. The domain may not exist or DNS is not resolving.",
      userMessage: "Can't find this website. Check that the URL is spelled correctly and the site is online."
    };
  }

  if (errorMsg.includes("ECONNREFUSED") || errorMsg.includes("ECONNRESET")) {
    return {
      healthReason: "Connection refused by the server. The site may be down or blocking connections.",
      userMessage: "The site refused our connection. It might be temporarily down. Camo will keep trying."
    };
  }

  // SSL/TLS error
  if (errorMsg.includes("SSL") || errorMsg.includes("TLS") || errorMsg.includes("certificate")) {
    return {
      healthReason: "SSL certificate error. The site may have an expired or invalid certificate.",
      userMessage: "This site has a security certificate issue. The site owner needs to fix their SSL certificate."
    };
  }

  // SSRF blocked
  if (errorMsg.includes("Blocked:")) {
    return {
      healthReason: errorMsg,
      userMessage: "This URL cannot be monitored for security reasons. Only public http/https URLs are supported."
    };
  }

  // Too many redirects
  if (errorMsg.includes("redirect")) {
    return {
      healthReason: "The page has too many redirects. It may be misconfigured.",
      userMessage: "This page keeps redirecting and never loads. The site may be misconfigured."
    };
  }

  // Generic fallback
  return {
    healthReason: errorMsg || "Unknown error occurred during page check.",
    userMessage: "Something went wrong while checking this page. Camo will try again at the next scheduled check."
  };
}

/** Increment monthly usage counter for the org */
async function incrementUsage(orgId: string) {
  try {
    await db
      .update(organizations)
      .set({ monthlyChecksUsed: sql`${organizations.monthlyChecksUsed} + 1` })
      .where(eq(organizations.id, orgId));
  } catch (err) { console.error("Failed to increment usage:", err); }
}

export interface CheckResult {
  monitorId: string;
  changed: boolean;
  summary: string | null;
  importanceScore: number | null;
  confidenceScore: number | null;
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
    return { monitorId, changed: false, summary: null, importanceScore: null, confidenceScore: null, error: "This monitor no longer exists. It may have been deleted." };
  }

  // Quota enforcement: check org hasn't exceeded monthly limit
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, monitor.orgId))
    .limit(1);

  if (org) {
    const now = new Date();
    // Reset quota if the reset date has passed
    if (org.quotaResetAt <= now) {
      const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First of next month
      await db
        .update(organizations)
        .set({ monthlyChecksUsed: 0, quotaResetAt: nextReset })
        .where(eq(organizations.id, org.id));
      org.monthlyChecksUsed = 0;
      org.quotaResetAt = nextReset;
    }

    if (org.monthlyChecksUsed >= org.monthlyCheckQuota) {
      return {
        monitorId,
        changed: false,
        summary: null,
        importanceScore: null,
        confidenceScore: null,
        error: "You've used all your monthly checks. Your quota resets on the 1st of next month, or you can upgrade your plan for more checks.",
      };
    }
  }

  // Fetch the page (HTTP first, browser fallback for Cloudflare/SPAs)
  const result = await smartFetch(monitor.url, {
    cssSelector: monitor.cssSelector,
    ignoreSelectors: monitor.ignoreSelectors,
    headers: monitor.headers as Record<string, string> | null,
  });

  // Update last checked time
  const now = new Date();

  if (result.error) {
    const errors = monitor.consecutiveErrors + 1;
    const healthStatus = errors >= 3 ? "error" : errors >= 2 ? "unstable" : "healthy";
    const classified = classifyError(result.statusCode, result.error, monitor.url);

    const healthReason = errors >= 3
      ? `${classified.healthReason} (failed ${errors} times in a row)`
      : errors >= 2
      ? `${classified.healthReason} (failed ${errors} times)`
      : classified.healthReason;

    await db
      .update(monitors)
      .set({
        lastCheckedAt: now,
        consecutiveErrors: errors,
        lastError: classified.userMessage,
        healthStatus,
        healthReason,
        healthCheckedAt: now,
        updatedAt: now,
      })
      .where(eq(monitors.id, monitorId));

    return { monitorId, changed: false, summary: null, importanceScore: null, confidenceScore: null, error: classified.userMessage };
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

  // ── Stage 1: Noise filtering ──
  const previousRaw = monitor.lastContentText || "";
  const filteredBefore = filterNoise(previousRaw);
  const filteredAfter = filterNoise(result.text);
  const signalScore = calculateSignalScore(previousRaw, result.text, filteredBefore, filteredAfter);

  // Only count as changed if content hash changed AND signal is meaningful
  const hashChanged = monitor.lastContentHash !== null && monitor.lastContentHash !== result.hash;
  const hasChanged = hashChanged && signalScore > 0;

  if (!hasChanged) {
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

    await incrementUsage(monitor.orgId);
    return { monitorId, changed: false, summary: null, importanceScore: null, confidenceScore: null, error: null };
  }

  // ── Keyword monitoring ──
  let keywordMatch = true; // default: alert on any change
  if (monitor.watchKeywords) {
    const keywords = monitor.watchKeywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
    const mode = monitor.keywordMode || "any";
    const beforeLower = previousRaw.toLowerCase();
    const afterLower = result.text.toLowerCase();

    if (mode === "appear") {
      // Alert only if a keyword appears in new content that wasn't in old
      keywordMatch = keywords.some(k => afterLower.includes(k) && !beforeLower.includes(k));
    } else if (mode === "disappear") {
      // Alert only if a keyword disappears from content
      keywordMatch = keywords.some(k => beforeLower.includes(k) && !afterLower.includes(k));
    } else {
      // "any" mode: alert if any keyword is mentioned in the change
      keywordMatch = keywords.some(k => afterLower.includes(k) || beforeLower.includes(k));
    }
  }

  // If keyword monitoring is configured and no match, skip storing the change
  if (monitor.watchKeywords && !keywordMatch) {
    // Still update the monitor content, just don't alert
    await db.update(monitors).set({
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
    }).where(eq(monitors.id, monitorId));
    await incrementUsage(monitor.orgId);
    return { monitorId, changed: false, summary: null, importanceScore: null, confidenceScore: null, error: null };
  }

  // ── Stage 2: Structured extraction ──
  const structuredAfter = extractStructuredContent(result.html);
  const pageType = structuredAfter.pageType;

  // ── Stage 3: Semantic gate (embeddings — 200x cheaper than LLM) ──
  const semanticResult = await semanticGate(previousRaw, result.text, pageType);

  // If semantic gate says skip: record as low-importance noise change without LLM
  if (semanticResult.recommendation === "skip_llm") {
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

    await incrementUsage(monitor.orgId);
    return { monitorId, changed: false, summary: null, importanceScore: null, confidenceScore: null, error: null };
  }

  // ── Stage 4: Confidence scoring ──
  // We don't store previous HTML in snapshots, so structural diff is unavailable
  // Use simplified scoring based on semantic gate + signal score only
  const confidence = {
    overall: Math.round((1 - semanticResult.similarity) * 70 + (signalScore / 100) * 30),
    structural: 0,
    semantic: Math.round((1 - semanticResult.similarity) * 100),
    noiseAdjusted: signalScore,
    breakdown: { headingsChanged: 0, pricesChanged: 0, contentChanged: 0, linksChanged: 0 },
  };

  // ── Stage 5: LLM summarization ──
  const isLowPriority = semanticResult.recommendation === "low_priority_llm";
  const previousText = monitor.lastContentText || "";
  const summaryResult = await summarizeChange(previousText, result.text, monitor.url);

  // Adjust importance using confidence score — blend LLM score with composite
  const adjustedImportance = isLowPriority
    ? Math.round(summaryResult.importanceScore * 0.4 + (confidence.overall / 10) * 0.3 + 1) // dampen for low priority
    : Math.round(summaryResult.importanceScore * 0.6 + (confidence.overall / 10) * 0.4);
  const finalImportance = Math.max(1, Math.min(10, adjustedImportance));

  // Find the previous snapshot for reference (descending: index 0 = current, index 1 = previous)
  const previousSnapshots = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.monitorId, monitorId))
    .orderBy(desc(snapshots.capturedAt))
    .limit(2);

  const beforeSnapshotId = previousSnapshots[1]?.id || null;

  // Calculate diff as percentage of changed characters
  let diffPercentage: string;
  const maxLen = Math.max(previousText.length, result.text.length);
  if (maxLen === 0) {
    diffPercentage = "0";
  } else {
    // Count character positions that differ
    let diffCount = Math.abs(previousText.length - result.text.length);
    const minLen = Math.min(previousText.length, result.text.length);
    for (let i = 0; i < minLen; i++) {
      if (previousText[i] !== result.text[i]) diffCount++;
    }
    diffPercentage = ((diffCount / maxLen) * 100).toFixed(2);
  }

  // Compute simple text diff (what was added/removed)
  const beforeSentences = new Set(previousText.split(/[.!?]\s+/).map(s => s.trim().toLowerCase()).filter(Boolean));
  const afterSentences = new Set(result.text.split(/[.!?]\s+/).map(s => s.trim().toLowerCase()).filter(Boolean));

  const added = result.text.split(/[.!?]\s+/).filter(s => s.trim() && !beforeSentences.has(s.trim().toLowerCase()));
  const removed = previousText.split(/[.!?]\s+/).filter(s => s.trim() && !afterSentences.has(s.trim().toLowerCase()));

  const addedText = added.slice(0, 5).join(". ").slice(0, 500) || null;
  const removedText = removed.slice(0, 5).join(". ").slice(0, 500) || null;

  // Enrich summary with page type context
  const enrichedSummary = pageType !== "general"
    ? `[${pageType}] ${summaryResult.summary}`
    : summaryResult.summary;

  // Store the change
  const [changeRecord] = await db.insert(changes).values({
    monitorId,
    orgId: monitor.orgId,
    snapshotBeforeId: beforeSnapshotId,
    snapshotAfterId: snapshot.id,
    summary: enrichedSummary,
    summaryModel: summaryResult.model,
    changeType: summaryResult.changeType,
    importanceScore: finalImportance,
    addedText,
    removedText,
    diffPercentage,
  }).returning();

  // ── Stage 6: Notifications (fire-and-forget) ──
  try {
    const configs = await db.select().from(alertConfigs)
      .where(
        or(
          eq(alertConfigs.monitorId, monitorId),
          isNull(alertConfigs.monitorId),
        )
      )
      .limit(10);

    const activeConfigs = configs.filter(
      (c) => c.isActive && finalImportance >= c.minImportance && c.orgId === monitor.orgId
    );

    if (activeConfigs.length > 0) {
      const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zikit.ai";
      const alertData = {
        monitorName: monitor.name,
        monitorUrl: monitor.url,
        summary: enrichedSummary,
        importanceScore: finalImportance,
        changeType: summaryResult.changeType,
        addedText,
        removedText,
        dashboardUrl: `${dashboardUrl}/dashboard/monitors/${monitorId}`,
      };

      const notificationPromises = activeConfigs.map((config) => {
        switch (config.channel) {
          case "email":
            return sendChangeAlert({ ...alertData, to: config.destination });
          case "slack":
            return sendSlackChangeAlert(config.destination, { ...alertData, to: config.destination });
          case "webhook":
            return sendWebhookAlert(config.destination, monitor.name, monitor.url, enrichedSummary, finalImportance, summaryResult.changeType);
          case "discord":
            return sendDiscordAlert(config.destination, monitor.name, monitor.url, enrichedSummary, finalImportance);
          case "telegram":
            return sendTelegramAlert(config.destination, monitor.name, monitor.url, enrichedSummary, finalImportance);
          default:
            return Promise.resolve(false);
        }
      });

      // Fire-and-forget: don't block the check on notification delivery
      Promise.allSettled(notificationPromises).then(async () => {
        try {
          await db.update(changes)
            .set({ notified: true, notifiedAt: new Date() })
            .where(eq(changes.id, changeRecord.id));
        } catch (err) {
          console.error("Failed to update notified status:", err);
        }
      });
    }
  } catch (err) {
    console.error("Notification dispatch failed (non-blocking):", err);
  }

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

  await incrementUsage(monitor.orgId);

  return {
    monitorId,
    changed: true,
    summary: enrichedSummary,
    importanceScore: finalImportance,
    confidenceScore: confidence.overall,
    error: null,
  };
}
