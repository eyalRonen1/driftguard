/**
 * Email notifications via Resend API.
 * Sends change alerts with AI summaries - the notification IS the product.
 *
 * Respects emailUnsubscribedAt — if set on the org, ALL emails are blocked.
 * Includes List-Unsubscribe headers (RFC 8058) for Gmail/GDPR compliance.
 */

import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateUnsubscribeUrl } from "./unsubscribe-token";

const RESEND_API = "https://api.resend.com/emails";

interface ChangeAlertData {
  to: string;
  orgId: string;
  monitorName: string;
  monitorUrl: string;
  summary: string;
  importanceScore: number;
  changeType: string;
  addedText?: string | null;
  removedText?: string | null;
  dashboardUrl: string;
}

/**
 * Check if an organization has unsubscribed from emails.
 * This is the highest authority — overrides any alert preferences.
 */
async function isOrgUnsubscribed(orgId: string): Promise<boolean> {
  try {
    const [org] = await db
      .select({ emailUnsubscribedAt: organizations.emailUnsubscribedAt })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);
    return !!org?.emailUnsubscribedAt;
  } catch (err) {
    console.error("Failed to check unsubscribe status:", err);
    // Fail open: if we can't check, send the email (don't silently drop)
    return false;
  }
}

export async function sendChangeAlert(data: ChangeAlertData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping email alert");
    return false;
  }

  // Check org-level unsubscribe — highest authority, blocks ALL emails
  if (data.orgId) {
    const unsubscribed = await isOrgUnsubscribed(data.orgId);
    if (unsubscribed) {
      console.log(`Email skipped: org ${data.orgId} has unsubscribed`);
      return false;
    }
  }

  const unsubscribeUrl = data.orgId ? generateUnsubscribeUrl(data.orgId) : "";

  const importanceColor = data.importanceScore >= 7 ? "#DC2626" : data.importanceScore >= 4 ? "#D97706" : "#6B7280";
  const importanceLabel = data.importanceScore >= 7 ? "Important" : data.importanceScore >= 4 ? "Notable" : "Minor";
  const emoji = data.importanceScore >= 7 ? "🔴" : data.importanceScore >= 4 ? "🟡" : "⚪";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0D1A0D; border-radius: 16px; overflow: hidden;">
      <!-- Header -->
      <div style="padding: 28px 24px 20px; background: linear-gradient(135deg, #0A1F0A 0%, #163016 50%, #1A3A1A 100%); text-align: center;">
        <img src="https://zikit.ai/assets/zikit-nav-logo.png" alt="Zikit" width="100" height="33" style="margin-bottom: 16px;" />
        <h1 style="margin: 0; color: #7CCB8B; font-size: 20px; font-weight: 700;">
          ${emoji} Change Detected
        </h1>
        <p style="margin: 8px 0 0; color: #9DB89D; font-size: 14px;">
          ${escapeHtml(data.monitorName)}
        </p>
      </div>

      <div style="padding: 24px; background: #0D1A0D;">
        <!-- AI Summary -->
        <div style="background: #142814; border-left: 4px solid #7CCB8B; padding: 16px 18px; border-radius: 0 10px 10px 0; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-size: 10px; color: #6B8F6B; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">AI Summary</p>
          <p style="margin: 0; font-size: 15px; color: #E8F0E8; line-height: 1.6;">${escapeHtml(data.summary)}</p>
        </div>

        <!-- Badges -->
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; padding: 5px 12px; background: ${data.importanceScore >= 7 ? "#3B1515" : data.importanceScore >= 4 ? "#3B2D15" : "#1A2A1A"}; color: ${importanceColor}; font-size: 12px; font-weight: 600; border-radius: 20px; margin-right: 8px; border: 1px solid ${importanceColor}33;">
            ${importanceLabel} (${data.importanceScore}/10)
          </span>
          <span style="display: inline-block; padding: 5px 12px; background: #142814; color: #7CCB8B; font-size: 12px; border-radius: 20px; border: 1px solid #7CCB8B33;">
            ${data.changeType}
          </span>
        </div>

        <!-- URL -->
        <p style="margin: 0 0 24px; font-size: 13px; color: #6B8F6B;">
          Page: <a href="${escapeHtml(data.monitorUrl)}" style="color: #7CCB8B; text-decoration: none;">${escapeHtml(data.monitorUrl)}</a>
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 8px;">
          <a href="${escapeHtml(data.dashboardUrl)}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #7CCB8B 0%, #5BB86B 100%); color: #0A1F0A; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px;">
            View Full Details
          </a>
        </div>

        <!-- Footer -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1A3A1A; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #4A6A4A;">
            Sent by <a href="https://zikit.ai" style="color: #7CCB8B; text-decoration: none;">Zikit.ai</a> &middot;
            <a href="${escapeHtml(data.dashboardUrl)}" style="color: #6B8F6B; text-decoration: none;">Manage alerts</a>
          </p>
          ${unsubscribeUrl ? `<p style="margin: 8px 0 0; font-size: 11px;">
            <a href="${escapeHtml(unsubscribeUrl)}" style="color: #6B8F6B; text-decoration: underline;">Unsubscribe from all emails</a>
          </p>` : ""}
          <p style="margin: 8px 0 0; font-size: 10px; color: #3A5A3A;">
            AI-powered website change monitoring
          </p>
        </div>
      </div>
    </div>`;

  try {
    const response = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Zikit <alerts@zikit.ai>",
        to: data.to,
        subject: `${emoji} ${data.monitorName}: ${data.summary.slice(0, 80)}`,
        html,
        // RFC 8058 List-Unsubscribe headers — required by Gmail for bulk senders
        ...(unsubscribeUrl ? {
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        } : {}),
      }),
    });

    return response.ok;
  } catch {
    console.error("Failed to send change alert email");
    return false;
  }
}

export async function sendSlackChangeAlert(
  webhookUrl: string,
  data: ChangeAlertData
): Promise<boolean> {
  try {
    const emoji = data.importanceScore >= 7 ? "🔴" : data.importanceScore >= 4 ? "🟡" : "⚪";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: `${emoji} Change detected: ${data.monitorName}` },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*AI Summary:*\n${data.summary}` },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Importance:* ${data.importanceScore}/10` },
              { type: "mrkdwn", text: `*Type:* ${data.changeType}` },
            ],
          },
          {
            type: "context",
            elements: [
              { type: "mrkdwn", text: `<${data.monitorUrl}|View page> · <${data.dashboardUrl}|View in dashboard>` },
            ],
          },
        ],
      }),
    });

    return response.ok;
  } catch {
    console.error("Failed to send Slack alert");
    return false;
  }
}

/**
 * Send a generic webhook notification
 */
export async function sendWebhookAlert(
  webhookUrl: string,
  monitorName: string,
  monitorUrl: string,
  summary: string,
  importance: number,
  changeType: string,
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "change_detected",
        monitor: { name: monitorName, url: monitorUrl },
        change: { summary, importance, changeType },
        timestamp: new Date().toISOString(),
        source: "zikit.ai",
      }),
    });
    return response.ok;
  } catch (err) {
    console.error("Webhook alert failed:", err);
    return false;
  }
}

/**
 * Send a Discord alert via webhook
 */
export async function sendDiscordAlert(
  webhookUrl: string,
  monitorName: string,
  monitorUrl: string,
  summary: string,
  importance: number,
): Promise<boolean> {
  const color = importance >= 7 ? 0xFF4444 : importance >= 4 ? 0xFFAA00 : 0x44CC88;
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: `Change detected: ${monitorName}`,
          description: summary,
          url: monitorUrl,
          color,
          fields: [
            { name: "Importance", value: `${importance}/10`, inline: true },
            { name: "Page", value: monitorUrl, inline: true },
          ],
          footer: { text: "Zikit - Website Change Monitoring" },
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    return response.ok;
  } catch (err) {
    console.error("Discord alert failed:", err);
    return false;
  }
}

/**
 * Send a Telegram alert via Bot API
 * @param botTokenAndChatId format: "botTOKEN:chatID"
 */
export async function sendTelegramAlert(
  botTokenAndChatId: string,
  monitorName: string,
  monitorUrl: string,
  summary: string,
  importance: number,
): Promise<boolean> {
  // Format: "botTOKEN:chatID" — split on first colon after "bot" prefix isn't safe
  // because bot tokens themselves contain a colon. Format is actually "TOKEN:CHATID"
  // where TOKEN = "123456:ABC-DEF" and CHATID = "987654"
  // So we split on the LAST colon.
  const lastColon = botTokenAndChatId.lastIndexOf(":");
  if (lastColon <= 0) return false;

  const botToken = botTokenAndChatId.slice(0, lastColon);
  const chatId = botTokenAndChatId.slice(lastColon + 1);
  if (!botToken || !chatId) return false;

  const emoji = importance >= 7 ? "🔴" : importance >= 4 ? "🟡" : "⚪";
  const importanceLabel = importance >= 7 ? "Important" : importance >= 4 ? "Notable" : "Minor";
  const bar = "█".repeat(importance) + "░".repeat(10 - importance);
  const text = [
    `${emoji} *Change Detected*`,
    ``,
    `📌 *${monitorName}*`,
    ``,
    `${summary}`,
    ``,
    `━━━━━━━━━━━━━━━`,
    `📊 Importance: ${bar} ${importance}/10 (${importanceLabel})`,
    `🔗 [View page](${monitorUrl})`,
    `🏠 [Open dashboard](https://zikit.ai/dashboard)`,
    ``,
    `_Sent by Zikit.ai_`,
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
    return response.ok;
  } catch (err) {
    console.error("Telegram alert failed:", err);
    return false;
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
