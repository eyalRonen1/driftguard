import { NextRequest, NextResponse } from "next/server";
import { handlePaddleWebhook } from "@/lib/billing/paddle";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify Paddle Billing v2 webhook signature.
 *
 * Paddle-Signature header format: ts=<timestamp>;h1=<hex-hmac>
 * Signed payload: "${ts}:${rawBody}"
 */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  // Fail closed: if no secret is configured, reject the request
  if (!secret) return false;

  if (!signatureHeader) return false;

  // Parse ts=...;h1=... from the Paddle-Signature header
  const parts = Object.fromEntries(
    signatureHeader.split(";").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key.trim(), rest.join("=")];
    })
  );

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Construct the signed payload per Paddle v2 spec
  const signedPayload = `${ts}:${rawBody}`;
  const computed = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  if (computed.length !== h1.length) return false;
  return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(h1, "hex"));
}

/**
 * Extract the `ts` value from a Paddle-Signature header string.
 * Header format: ts=<timestamp>;h1=<hex-hmac>
 */
function extractTimestamp(signatureHeader: string | null): string | null {
  if (!signatureHeader) return null;
  const match = signatureHeader.match(/(?:^|;)\s*ts=(\d+)/);
  return match ? match[1] : null;
}

const processedEvents = new Set<string>();

// POST /api/webhooks/paddle - Handle Paddle webhook events
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("Paddle-Signature");

  if (!verifySignature(rawBody, signatureHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Replay protection: reject webhooks older than 5 minutes
  const ts = extractTimestamp(signatureHeader);
  if (ts) {
    const signatureAge = Math.floor(Date.now() / 1000) - parseInt(ts);
    if (signatureAge > 300) { // 5 minutes
      return NextResponse.json({ error: "Webhook too old" }, { status: 400 });
    }
  }

  try {
    const event = JSON.parse(rawBody);
    const eventId = event.event_id || event.notification_id || "";
    if (eventId && processedEvents.has(eventId)) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
    await handlePaddleWebhook(event);
    if (eventId) { processedEvents.add(eventId); setTimeout(() => processedEvents.delete(eventId), 3600000); }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paddle webhook processing error:", err);
    // Return 200 to prevent Paddle retry storms -- handle errors asynchronously
    return NextResponse.json({ received: true, processed: false }, { status: 200 });
  }
}
