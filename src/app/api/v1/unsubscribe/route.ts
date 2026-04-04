/**
 * One-click email unsubscribe endpoint.
 * CAN-SPAM / GDPR compliant — no auth required, works from email links.
 *
 * GET  /api/v1/unsubscribe?token=ORG_ID.HMAC_SIGNATURE
 * POST /api/v1/unsubscribe?token=ORG_ID.HMAC_SIGNATURE  (List-Unsubscribe-Post)
 *
 * Sets emailUnsubscribedAt on the org, which is checked before every email send.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyUnsubscribeToken } from "@/lib/notifications/unsubscribe-token";
import { logActivity } from "@/lib/activity-log";

function unsubscribeHtmlPage(success: boolean, message: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${success ? "Unsubscribed" : "Error"} - Zikit</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0A1F0A;
      color: #E8F0E8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #0D1A0D;
      border: 1px solid #1A3A1A;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 90%;
      text-align: center;
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: ${success ? "#7CCB8B" : "#DC2626"}; margin-bottom: 12px; }
    p { font-size: 15px; color: #9DB89D; line-height: 1.6; margin-bottom: 24px; }
    .cta {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #7CCB8B 0%, #5BB86B 100%);
      color: #0A1F0A;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
    }
    .footer { margin-top: 32px; font-size: 12px; color: #4A6A4A; }
    .footer a { color: #7CCB8B; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "&#10003;" : "&#10007;"}</div>
    <h1>${success ? "You've been unsubscribed" : "Something went wrong"}</h1>
    <p>${message}</p>
    ${success ? '<a href="https://zikit.ai/dashboard" class="cta">Go to Dashboard</a>' : ""}
    <div class="footer">
      <a href="https://zikit.ai">Zikit.ai</a> &middot; AI-Powered Website Change Monitoring
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: success ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function handleUnsubscribe(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return unsubscribeHtmlPage(false, "Missing unsubscribe token. Please use the link from your email.");
  }

  const orgId = verifyUnsubscribeToken(token);
  if (!orgId) {
    return unsubscribeHtmlPage(false, "Invalid or expired unsubscribe link. Please use the latest link from your email.");
  }

  try {
    // Verify org exists
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      return unsubscribeHtmlPage(false, "Organization not found. It may have been deleted.");
    }

    // Set emailUnsubscribedAt — this is the highest authority, overrides all alert preferences
    await db
      .update(organizations)
      .set({ emailUnsubscribedAt: new Date() })
      .where(eq(organizations.id, orgId));

    const ip = request.headers.get("x-forwarded-for") || undefined;
    logActivity({
      orgId,
      action: "alert.unsubscribe",
      targetType: "organization",
      targetId: orgId,
      ip,
    });

    return unsubscribeHtmlPage(
      true,
      "You will no longer receive email alerts from Zikit. You can re-enable emails anytime from your dashboard alert preferences."
    );
  } catch (err) {
    console.error("Unsubscribe failed:", err);
    return unsubscribeHtmlPage(false, "An unexpected error occurred. Please try again later.");
  }
}

// GET handler — one-click unsubscribe from email links
export async function GET(request: NextRequest) {
  return handleUnsubscribe(request);
}

// POST handler — RFC 8058 List-Unsubscribe-Post (required by Gmail)
export async function POST(request: NextRequest) {
  return handleUnsubscribe(request);
}
