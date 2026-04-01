/**
 * Email notifications via Resend API.
 * Sends change alerts with AI summaries - the notification IS the product.
 */

const RESEND_API = "https://api.resend.com/emails";

interface ChangeAlertData {
  to: string;
  monitorName: string;
  monitorUrl: string;
  summary: string;
  importanceScore: number;
  changeType: string;
  addedText?: string | null;
  removedText?: string | null;
  dashboardUrl: string;
}

export async function sendChangeAlert(data: ChangeAlertData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("RESEND_API_KEY not set, skipping email alert");
    return false;
  }

  const importanceColor = data.importanceScore >= 7 ? "#DC2626" : data.importanceScore >= 4 ? "#D97706" : "#6B7280";
  const importanceLabel = data.importanceScore >= 7 ? "Important" : data.importanceScore >= 4 ? "Notable" : "Minor";
  const emoji = data.importanceScore >= 7 ? "🔴" : data.importanceScore >= 4 ? "🟡" : "⚪";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="padding: 24px; background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 18px; font-weight: 600;">
          ${emoji} Change detected
        </h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">
          ${data.monitorName}
        </p>
      </div>

      <div style="padding: 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
        <!-- AI Summary -->
        <div style="background: #F0F9FF; border-left: 4px solid #3B82F6; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
          <p style="margin: 0 0 4px; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">AI Summary</p>
          <p style="margin: 0; font-size: 15px; color: #111827; line-height: 1.5;">${escapeHtml(data.summary)}</p>
        </div>

        <!-- Badges -->
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; padding: 4px 10px; background: ${importanceColor}15; color: ${importanceColor}; font-size: 12px; font-weight: 600; border-radius: 12px; margin-right: 8px;">
            ${importanceLabel} (${data.importanceScore}/10)
          </span>
          <span style="display: inline-block; padding: 4px 10px; background: #EFF6FF; color: #1D4ED8; font-size: 12px; border-radius: 12px;">
            ${data.changeType}
          </span>
        </div>

        <!-- URL -->
        <p style="margin: 0 0 20px; font-size: 13px; color: #6B7280;">
          Page: <a href="${data.monitorUrl}" style="color: #2563EB;">${data.monitorUrl}</a>
        </p>

        <!-- CTA -->
        <a href="${data.dashboardUrl}" style="display: inline-block; padding: 10px 24px; background: #1E40AF; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
          View full details
        </a>

        <!-- Footer -->
        <p style="margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF;">
          Sent by <a href="https://zikit.ai" style="color: #6B7280;">Zikit</a> ·
          <a href="${data.dashboardUrl}/settings" style="color: #6B7280;">Manage alerts</a>
        </p>
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

  const emoji = importance >= 7 ? "!!!" : importance >= 4 ? "!" : "";
  const text = `${emoji} *${monitorName}*\n\n${summary}\n\nPage: ${monitorUrl}\nImportance: ${importance}/10`;

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
