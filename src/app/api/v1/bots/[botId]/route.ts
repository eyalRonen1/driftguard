import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatbots } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { updateChatbotSchema } from "@/lib/validators/chatbot";
import { encrypt } from "@/lib/crypto";
import { getAuthenticatedOrg } from "@/lib/db/get-org";

// GET /api/v1/bots/[botId]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [bot] = await db
    .select()
    .from(chatbots)
    .where(and(eq(chatbots.id, botId), eq(chatbots.orgId, auth.org.id)))
    .limit(1);

  if (!bot) return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  return NextResponse.json({ bot });
}

// PATCH /api/v1/bots/[botId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateChatbotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };

  if (data.apiKey !== undefined) {
    updateData.apiKeyEncrypted = data.apiKey ? encrypt(data.apiKey) : null;
    delete updateData.apiKey;
  }

  const [bot] = await db
    .update(chatbots)
    .set(updateData)
    .where(and(eq(chatbots.id, botId), eq(chatbots.orgId, auth.org.id)))
    .returning();

  if (!bot) return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  return NextResponse.json({ bot });
}

// DELETE /api/v1/bots/[botId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [bot] = await db
    .delete(chatbots)
    .where(and(eq(chatbots.id, botId), eq(chatbots.orgId, auth.org.id)))
    .returning();

  if (!bot) return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
