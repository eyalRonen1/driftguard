import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { testCases, chatbots, organizations, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createTestCaseSchema } from "@/lib/validators/chatbot";

async function verifyBotAccess(supabaseAuthId: string, botId: string) {
  const result = await db
    .select({ bot: chatbots })
    .from(chatbots)
    .innerJoin(organizations, eq(chatbots.orgId, organizations.id))
    .innerJoin(users, eq(organizations.ownerId, users.id))
    .where(and(eq(users.supabaseAuthId, supabaseAuthId), eq(chatbots.id, botId)))
    .limit(1);

  return result[0]?.bot ?? null;
}

// GET /api/v1/bots/[botId]/tests - List test cases
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

  const bot = await verifyBotAccess(user.id, botId);
  if (!bot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  const tests = await db
    .select()
    .from(testCases)
    .where(and(eq(testCases.chatbotId, botId), eq(testCases.isActive, true)))
    .orderBy(testCases.createdAt);

  return NextResponse.json({ tests });
}

// POST /api/v1/bots/[botId]/tests - Create a test case
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bot = await verifyBotAccess(user.id, botId);
  if (!bot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createTestCaseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { semanticThreshold, ...rest } = parsed.data;
  const [test] = await db
    .insert(testCases)
    .values({
      chatbotId: botId,
      ...rest,
      semanticThreshold: semanticThreshold.toString(),
    })
    .returning();

  return NextResponse.json({ test }, { status: 201 });
}
