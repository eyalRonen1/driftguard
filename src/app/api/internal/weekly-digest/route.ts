/**
 * Cron endpoint - sends weekly digest emails to org owners.
 * Called by Vercel Cron every Monday at 08:00 UTC.
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { changes, monitors, organizations, users } from "@/lib/db/schema";
import { eq, gte, desc, sql } from "drizzle-orm";
import { timingSafeEqual } from "crypto";

const RESEND_API = "https://api.resend.com/emails";

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping weekly digest");
    return NextResponse.json({ sent: 0, skipped: "no_api_key", timestamp: new Date().toISOString() });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);

  // Find distinct org IDs that have changes in the last 7 days
  const orgsWithChanges = await db
    .selectDistinct({ orgId: changes.orgId })
    .from(changes)
    .where(gte(changes.createdAt, sevenDaysAgo));

  let sentCount = 0;

  for (const { orgId } of orgsWithChanges) {
    try {
      // Get top 10 changes by importance, joined with monitor info
      const topChanges = await db
        .select({
          summary: changes.summary,
          importanceScore: changes.importanceScore,
          changeType: changes.changeType,
          createdAt: changes.createdAt,
          monitorName: monitors.name,
          monitorUrl: monitors.url,
        })
        .from(changes)
        .innerJoin(monitors, eq(changes.monitorId, monitors.id))
        .where(
          sql`${changes.orgId} = ${orgId} AND ${changes.createdAt} >= ${sevenDaysAgo}`
        )
        .orderBy(desc(changes.importanceScore), desc(changes.createdAt))
        .limit(10);

      if (topChanges.length === 0) continue;

      // Get org owner's email
      const orgRow = await db
        .select({ ownerEmail: users.email, orgName: organizations.name })
        .from(organizations)
        .innerJoin(users, eq(organizations.ownerId, users.id))
        .where(eq(organizations.id, orgId))
        .limit(1);

      if (orgRow.length === 0) continue;

      const { ownerEmail, orgName } = orgRow[0];

      // Count total changes (may be more than the top 10 we display)
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(changes)
        .where(
          sql`${changes.orgId} = ${orgId} AND ${changes.createdAt} >= ${sevenDaysAgo}`
        );
      const totalChanges = countResult[0]?.count ?? topChanges.length;

      // Build the email HTML
      const html = buildDigestHtml(topChanges, totalChanges, orgName);

      const response = await fetch(RESEND_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "Zikit <digest@zikit.ai>",
          to: ownerEmail,
          subject: `Your weekly Zikit digest: ${totalChanges} change${totalChanges === 1 ? "" : "s"} detected`,
          html,
        }),
      });

      if (response.ok) sentCount++;
    } catch (err) {
      console.error(`Weekly digest failed for org ${orgId}:`, err);
    }
  }

  return NextResponse.json({
    sent: sentCount,
    timestamp: now.toISOString(),
  });
}

// ==========================================
// HTML builder
// ==========================================

interface DigestChange {
  summary: string;
  importanceScore: number;
  changeType: string;
  createdAt: Date;
  monitorName: string;
  monitorUrl: string;
}

function buildDigestHtml(
  topChanges: DigestChange[],
  totalChanges: number,
  orgName: string,
): string {
  const changeRows = topChanges
    .map((c) => {
      const color =
        c.importanceScore >= 7
          ? "#DC2626"
          : c.importanceScore >= 4
            ? "#D97706"
            : "#6B7280";
      const label =
        c.importanceScore >= 7
          ? "Important"
          : c.importanceScore >= 4
            ? "Notable"
            : "Minor";
      const date = new Date(c.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const truncatedSummary =
        c.summary.length > 120 ? c.summary.slice(0, 117) + "..." : c.summary;

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
            <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">
              ${escapeHtml(c.monitorName)}
            </div>
            <div style="font-size: 13px; color: #374151; line-height: 1.4; margin-bottom: 6px;">
              ${escapeHtml(truncatedSummary)}
            </div>
            <span style="display: inline-block; padding: 2px 8px; background: ${color}15; color: ${color}; font-size: 11px; font-weight: 600; border-radius: 10px; margin-right: 6px;">
              ${label} (${c.importanceScore}/10)
            </span>
            <span style="display: inline-block; padding: 2px 8px; background: #EFF6FF; color: #1D4ED8; font-size: 11px; border-radius: 10px; margin-right: 6px;">
              ${escapeHtml(c.changeType)}
            </span>
            <span style="font-size: 11px; color: #9CA3AF;">${date}</span>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="padding: 24px; background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 18px; font-weight: 600;">
          Your Weekly Zikit Digest
        </h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">
          ${totalChanges} change${totalChanges === 1 ? "" : "s"} detected across your monitors this week
        </p>
      </div>

      <div style="padding: 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tbody>
            ${changeRows}
          </tbody>
        </table>

        ${totalChanges > 10 ? `<p style="margin: 16px 0 0; font-size: 13px; color: #6B7280;">...and ${totalChanges - 10} more change${totalChanges - 10 === 1 ? "" : "s"}</p>` : ""}

        <div style="margin-top: 24px;">
          <a href="https://zikit.ai/dashboard" style="display: inline-block; padding: 10px 24px; background: #1E40AF; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
            View all changes
          </a>
        </div>

        <p style="margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF;">
          Sent by <a href="https://zikit.ai" style="color: #6B7280;">Zikit</a> &middot;
          <a href="https://zikit.ai/dashboard/settings" style="color: #6B7280;">Manage alerts</a>
        </p>
      </div>
    </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
