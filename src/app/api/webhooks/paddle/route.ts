import { NextRequest, NextResponse } from "next/server";
import { handlePaddleWebhook } from "@/lib/billing/paddle";
import { createHmac } from "crypto";

/**
 * Verify Paddle webhook signature
 */
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification in dev if no secret set

  if (!signature) return false;

  const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
  return computed === signature;
}

// POST /api/webhooks/paddle - Handle Paddle webhook events
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    await handlePaddleWebhook(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paddle webhook error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
