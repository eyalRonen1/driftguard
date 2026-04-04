/**
 * Chat Actions Executor - Handles real dashboard actions triggered by Camo chat.
 * Uses OpenAI function calling. All actions require authentication.
 */

import { db } from "@/lib/db";
import { monitors, changes, snapshots, organizations } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { checkMonitor } from "@/lib/scan-engine/checker";
import { fetchPage } from "@/lib/scan-engine/fetcher";
import { getNextCheckTime } from "@/lib/utils/check-schedule";
import { rateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS, type PlanCode } from "@/lib/billing/paddle";

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  actionId?: string;
}

interface AuthContext {
  userId: string;
  orgId: string;
}

// Find a monitor by name (fuzzy match)
async function findMonitorByName(orgId: string, name: string) {
  const allMonitors = await db.select().from(monitors)
    .where(eq(monitors.orgId, orgId));

  const lower = name.toLowerCase();
  // Exact match first
  let match = allMonitors.find(m => m.name.toLowerCase() === lower);
  // Partial match
  if (!match) match = allMonitors.find(m => m.name.toLowerCase().includes(lower));
  // URL match
  if (!match) match = allMonitors.find(m => m.url.toLowerCase().includes(lower));
  return match;
}

export async function executeAction(
  action: string,
  params: Record<string, any>,
  auth: AuthContext,
  confirmed: boolean = false
): Promise<ActionResult> {
  const actionLimits: Record<string, { max: number; windowMs: number }> = {
    create_monitor: { max: 5, windowMs: 3600000 },
    delete_monitor: { max: 3, windowMs: 3600000 },
    check_monitor: { max: 10, windowMs: 3600000 },
    pause_monitor: { max: 10, windowMs: 3600000 },
    resume_monitor: { max: 10, windowMs: 3600000 },
    list_monitors: { max: 30, windowMs: 60000 },
    get_stats: { max: 30, windowMs: 60000 },
    get_changes: { max: 30, windowMs: 60000 },
  };
  const actionLimit = actionLimits[action];
  if (actionLimit) {
    const { allowed } = await rateLimit(`action:${action}:${auth.userId}`, actionLimit.max, actionLimit.windowMs);
    if (!allowed) return { success: false, message: "You're doing that too often. Please wait a bit." };
  }

  switch (action) {
    case "list_monitors": {
      const result = await db.select({
        id: monitors.id,
        name: monitors.name,
        url: monitors.url,
        isActive: monitors.isActive,
        isPaused: monitors.isPaused,
        healthStatus: monitors.healthStatus,
        lastCheckedAt: monitors.lastCheckedAt,
        checkFrequency: monitors.checkFrequency,
      }).from(monitors).where(eq(monitors.orgId, auth.orgId));

      return {
        success: true,
        message: `Found ${result.length} monitor(s).`,
        data: { monitors: result },
      };
    }

    case "get_stats": {
      const [org] = await db.select().from(organizations).where(eq(organizations.id, auth.orgId)).limit(1);
      const monitorCount = await db.select({ count: sql<number>`count(*)` }).from(monitors).where(eq(monitors.orgId, auth.orgId));
      const changeCount = await db.select({ count: sql<number>`count(*)` }).from(changes).where(eq(changes.orgId, auth.orgId));
      const activeCount = await db.select({ count: sql<number>`count(*)` }).from(monitors).where(and(eq(monitors.orgId, auth.orgId), eq(monitors.isActive, true), eq(monitors.isPaused, false)));

      return {
        success: true,
        message: "Here are your account stats.",
        data: {
          totalMonitors: Number(monitorCount[0]?.count || 0),
          activeMonitors: Number(activeCount[0]?.count || 0),
          totalChanges: Number(changeCount[0]?.count || 0),
          plan: org?.plan || "free",
          monthlyChecksUsed: org?.monthlyChecksUsed || 0,
          monthlyCheckQuota: org?.monthlyCheckQuota || 100,
        },
      };
    }

    case "create_monitor": {
      const { url, name, checkFrequency } = params;
      if (!url) return { success: false, message: "I need a URL to monitor. What page should I watch?" };

      // Plan enforcement
      const org = await db.select().from(organizations).where(eq(organizations.id, auth.orgId)).limit(1);
      const plan = (org[0]?.plan || "free") as PlanCode;
      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

      // Check monitor limit
      const [{ count: currentCount }] = await db.select({ count: sql<number>`count(*)` })
        .from(monitors).where(eq(monitors.orgId, auth.orgId));
      if (currentCount >= limits.monitors) {
        return { success: false, message: `You've reached your ${plan} plan limit of ${limits.monitors} monitors. Upgrade to add more!` };
      }

      // Check frequency
      const freq = checkFrequency || "daily";
      const allowedFreqs: readonly string[] = limits.checkFrequency;
      if (!allowedFreqs.includes(freq)) {
        return { success: false, message: `"${freq}" checks aren't available on your ${plan} plan. Available: ${allowedFreqs.join(", ")}.` };
      }

      // Auto-add https + validate URL
      let monitorUrl = url;
      if (!/^https?:\/\//i.test(monitorUrl)) monitorUrl = `https://${monitorUrl}`;
      try { new URL(monitorUrl); } catch {
        return { success: false, message: "That doesn't look like a valid URL. Try something like example.com." };
      }

      // Validate name length
      const monitorName = (name || new URL(monitorUrl).hostname).slice(0, 255);

      // Preflight check
      const preflight = await fetchPage(monitorUrl, { timeoutMs: 10000 });
      if (preflight.error) {
        return { success: false, message: `I couldn't reach ${monitorUrl}: ${preflight.error}. Check the URL?` };
      }

      const [newMonitor] = await db.insert(monitors).values({
        orgId: auth.orgId,
        name: monitorName,
        url: monitorUrl,
        checkFrequency: freq,
        lastContentHash: preflight.hash,
        lastContentText: preflight.text,
        lastCheckedAt: new Date(),
        nextCheckAt: getNextCheckTime(freq),
        healthStatus: "healthy",
        lastHealthyAt: new Date(),
      }).returning();

      // Create baseline snapshot
      await db.insert(snapshots).values({
        monitorId: newMonitor.id,
        contentText: preflight.text,
        contentHash: preflight.hash,
        contentLength: preflight.contentLength,
        statusCode: preflight.statusCode,
        responseTimeMs: preflight.responseTimeMs,
      });

      return {
        success: true,
        message: `Done! I'm now watching "${monitorName}" (${freq}). I saved a baseline snapshot.`,
        data: { monitor: { id: newMonitor.id, name: monitorName, url: monitorUrl } },
      };
    }

    case "check_monitor": {
      const monitor = await findMonitorByName(auth.orgId, params.name || "");
      if (!monitor) return { success: false, message: `I couldn't find a monitor matching "${params.name}". Try "list monitors" to see all of them.` };

      const result = await checkMonitor(monitor.id);
      if (result.error) return { success: false, message: `Check failed for "${monitor.name}": ${result.error}` };

      return {
        success: true,
        message: result.changed
          ? `Found changes on "${monitor.name}"! ${result.summary || ""}`
          : `No changes detected on "${monitor.name}". Everything looks the same.`,
        data: { changed: result.changed, summary: result.summary },
      };
    }

    case "pause_monitor": {
      const monitor = await findMonitorByName(auth.orgId, params.name || "");
      if (!monitor) return { success: false, message: `I couldn't find "${params.name}".` };
      if (monitor.isPaused) return { success: true, message: `"${monitor.name}" is already paused.` };

      await db.update(monitors).set({ isPaused: true, updatedAt: new Date() }).where(eq(monitors.id, monitor.id));
      return { success: true, message: `Paused "${monitor.name}". I won't check it until you resume.` };
    }

    case "resume_monitor": {
      const monitor = await findMonitorByName(auth.orgId, params.name || "");
      if (!monitor) return { success: false, message: `I couldn't find "${params.name}".` };
      if (!monitor.isPaused) return { success: true, message: `"${monitor.name}" is already active.` };

      await db.update(monitors).set({ isPaused: false, nextCheckAt: getNextCheckTime(monitor.checkFrequency), updatedAt: new Date() }).where(eq(monitors.id, monitor.id));
      return { success: true, message: `Resumed "${monitor.name}". Next check coming up!` };
    }

    case "delete_monitor": {
      const monitor = await findMonitorByName(auth.orgId, params.name || "");
      if (!monitor) return { success: false, message: `I couldn't find "${params.name}".` };

      if (!confirmed) {
        return {
          success: true,
          requiresConfirmation: true,
          confirmationMessage: `Are you sure you want to delete "${monitor.name}" and all its history? This cannot be undone.`,
          actionId: `delete:${monitor.id}`,
          message: "",
        };
      }

      await db.delete(monitors).where(eq(monitors.id, monitor.id));
      return { success: true, message: `Deleted "${monitor.name}" and all its history.` };
    }

    case "get_changes": {
      const monitor = await findMonitorByName(auth.orgId, params.name || "");
      if (!monitor) return { success: false, message: `I couldn't find "${params.name}".` };

      const recentChanges = await db.select({
        summary: changes.summary,
        changeType: changes.changeType,
        importanceScore: changes.importanceScore,
        createdAt: changes.createdAt,
      }).from(changes).where(eq(changes.monitorId, monitor.id)).orderBy(desc(changes.createdAt)).limit(5);

      if (recentChanges.length === 0) {
        return { success: true, message: `No changes detected yet on "${monitor.name}".`, data: { changes: [] } };
      }

      return {
        success: true,
        message: `Here are the latest ${recentChanges.length} changes on "${monitor.name}".`,
        data: { monitorName: monitor.name, changes: recentChanges },
      };
    }

    default:
      return { success: false, message: "I don't know how to do that yet." };
  }
}
