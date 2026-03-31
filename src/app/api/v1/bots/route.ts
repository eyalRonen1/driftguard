import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { chatbots, organizations, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createChatbotSchema } from "@/lib/validators/chatbot";
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

// GET /api/v1/bots - List all chatbots for the authenticated user's org
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getAuthenticatedOrg(user.id);
  if (!org) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 });
  }

  const bots = await db
    .select()
    .from(chatbots)
    .where(eq(chatbots.orgId, org.id))
    .orderBy(chatbots.createdAt);

  return NextResponse.json({ bots });
}

// POST /api/v1/bots - Create a new chatbot
export async function POST(request: NextRequest) {
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
  const parsed = createChatbotSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Encrypt API key if provided
  const apiKeyEncrypted = data.apiKey ? encrypt(data.apiKey) : null;

  const [bot] = await db
    .insert(chatbots)
    .values({
      orgId: org.id,
      name: data.name,
      connectionType: data.connectionType,
      endpointUrl: data.endpointUrl,
      apiKeyEncrypted,
      requestTemplate: data.requestTemplate ?? null,
      responsePath: data.responsePath ?? null,
      headers: data.headers ?? {},
      scanFrequency: data.scanFrequency,
      timeoutMs: data.timeoutMs,
      scanDelayMs: data.scanDelayMs,
      websiteUrl: data.websiteUrl ?? null,
      description: data.description ?? null,
      nextScanAt: new Date(),
    })
    .returning();

  return NextResponse.json({ bot }, { status: 201 });
}
