import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { chatbots, organizations, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { updateChatbotSchema } from "@/lib/validators/chatbot";
import { encrypt } from "@/lib/crypto";

async function getAuthenticatedOrg(supabaseAuthId: string) {
  const result = await db
    .select({ org: organizations })
    .from(organizations)
    .innerJoin(users, eq(organizations.ownerId, users.id))
    .where(eq(users.supabaseAuthId, supabaseAuthId))
    .limit(1);

  return result[0]?.org ?? null;
}

// GET /api/v1/bots/[botId] - Get a single chatbot
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getAuthenticatedOrg(user.id);
  if (!org) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 });
  }

  const [bot] = await db
    .select()
    .from(chatbots)
    .where(and(eq(chatbots.id, botId), eq(chatbots.orgId, org.id)))
    .limit(1);

  if (!bot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  return NextResponse.json({ bot });
}

// PATCH /api/v1/bots/[botId] - Update a chatbot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getAuthenticatedOrg(user.id);
  if (!org) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateChatbotSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };

  // Handle API key encryption
  if (data.apiKey !== undefined) {
    updateData.apiKeyEncrypted = data.apiKey ? encrypt(data.apiKey) : null;
    delete updateData.apiKey;
  }

  const [bot] = await db
    .update(chatbots)
    .set(updateData)
    .where(and(eq(chatbots.id, botId), eq(chatbots.orgId, org.id)))
    .returning();

  if (!bot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  return NextResponse.json({ bot });
}

// DELETE /api/v1/bots/[botId] - Delete a chatbot
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getAuthenticatedOrg(user.id);
  if (!org) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 });
  }

  const [bot] = await db
    .delete(chatbots)
    .where(and(eq(chatbots.id, botId), eq(chatbots.orgId, org.id)))
    .returning();

  if (!bot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
