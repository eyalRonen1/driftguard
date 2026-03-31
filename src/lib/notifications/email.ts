/**
 * Email notifications via Resend API.
 * Sends drift alerts and weekly digests.
 */

const RESEND_API = "https://api.resend.com/emails";

interface DriftAlertData {
  to: string;
  botName: string;
  previousScore: number;
  currentScore: number;
  failedTests: Array<{
    question: string;
    expectedAnswer: string;
    actualAnswer: string;
    score: number;
  }>;
  dashboardUrl: string;
}

export async function sendDriftAlert(data: DriftAlertData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  const failedTestsHtml = data.failedTests
    .map(
      (t) => `
      <div style="margin-bottom: 16px; padding: 12px; background: #FEF2F2; border-radius: 8px; border-left: 4px solid #EF4444;">
        <p style="margin: 0 0 4px; font-weight: 600; color: #991B1B;">Q: ${escapeHtml(t.question)}</p>
        <p style="margin: 0 0 4px; color: #6B7280; font-size: 14px;">Expected: ${escapeHtml(t.expectedAnswer.slice(0, 200))}</p>
        <p style="margin: 0 0 4px; color: #DC2626; font-size: 14px;">Got: ${escapeHtml((t.actualAnswer || "No response").slice(0, 200))}</p>
        <p style="margin: 0; color: #9CA3AF; font-size: 12px;">Score: ${t.score}%</p>
      </div>`
    )
    .join("");

  const scoreColor = data.currentScore >= 80 ? "#059669" : data.currentScore >= 50 ? "#D97706" : "#DC2626";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 24px; background: #1E40AF; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: white; font-size: 20px;">DriftGuard Alert</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 8px; font-size: 18px;">${escapeHtml(data.botName)} quality dropped</h2>
        <div style="display: flex; gap: 16px; margin-bottom: 20px;">
          <div style="padding: 12px 20px; background: #F3F4F6; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #6B7280; font-size: 12px;">Previous</p>
            <p style="margin: 4px 0 0; font-size: 24px; font-weight: 700;">${data.previousScore}%</p>
          </div>
          <div style="display: flex; align-items: center; font-size: 24px; color: #DC2626;">→</div>
          <div style="padding: 12px 20px; background: #FEF2F2; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #6B7280; font-size: 12px;">Current</p>
            <p style="margin: 4px 0 0; font-size: 24px; font-weight: 700; color: ${scoreColor};">${data.currentScore}%</p>
          </div>
        </div>
        <h3 style="margin: 0 0 12px; font-size: 16px;">Failed tests:</h3>
        ${failedTestsHtml}
        <a href="${data.dashboardUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #1E40AF; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">View in Dashboard</a>
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
        from: "DriftGuard <alerts@driftguard.com>",
        to: data.to,
        subject: `⚠️ ${data.botName} health dropped to ${data.currentScore}%`,
        html,
      }),
    });

    return response.ok;
  } catch {
    console.error("Failed to send drift alert email");
    return false;
  }
}

export async function sendSlackAlert(
  webhookUrl: string,
  data: DriftAlertData
): Promise<boolean> {
  try {
    const failedList = data.failedTests
      .map((t) => `• *Q:* ${t.question}\n  Expected: _${t.expectedAnswer.slice(0, 100)}_\n  Got: _${(t.actualAnswer || "No response").slice(0, 100)}_\n  Score: ${t.score}%`)
      .join("\n\n");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: `⚠️ ${data.botName} quality dropped` },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Previous Score:*\n${data.previousScore}%` },
              { type: "mrkdwn", text: `*Current Score:*\n${data.currentScore}%` },
            ],
          },
          { type: "divider" },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*Failed Tests:*\n\n${failedList}` },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View Dashboard" },
                url: data.dashboardUrl,
                style: "primary",
              },
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
