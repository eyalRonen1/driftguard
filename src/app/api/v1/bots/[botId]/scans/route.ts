import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { scanRuns, chatbots, organizations, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { executeScan } from "@/lib/scan-engine/executor";

async function verifyBotAccess(supabaseAuthId: string, botId: string) {
  const result = await db
    .select({ bot: chatbots, org: organizations })
    .from(chatbots)
    .innerJoin(organizations, eq(chatbots.orgId, organizations.id))
    .innerJoin(users, eq(organizations.ownerId, users.id))
    .where(and(eq(users.supabaseAuthId, supabaseAuthId), eq(chatbots.id, botId)))
    .limit(1);

  return result[0] ?? null;
}

// GET /api/v1/bots/[botId]/scans - List scan history
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

  const access = await verifyBotAccess(user.id, botId);
  if (!access) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  const scans = await db
    .select()
    .from(scanRuns)
    .where(eq(scanRuns.chatbotId, botId))
    .orderBy(desc(scanRuns.createdAt))
    .limit(50);

  return NextResponse.json({ scans });
}

// POST /api/v1/bots/[botId]/scans - Trigger a manual scan
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await verifyBotAccess(user.id, botId);
  if (!access) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  try {
    const result = await executeScan(botId, access.org.id, "manual");
    return NextResponse.json({ scan: result }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
