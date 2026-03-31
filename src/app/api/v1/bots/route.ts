import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatbots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createChatbotSchema } from "@/lib/validators/chatbot";
import { encrypt } from "@/lib/crypto";
import { getAuthenticatedOrg } from "@/lib/db/get-org";

// GET /api/v1/bots - List all chatbots
export async function GET() {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bots = await db
    .select()
    .from(chatbots)
    .where(eq(chatbots.orgId, auth.org.id))
    .orderBy(chatbots.createdAt);

  return NextResponse.json({ bots });
}

// POST /api/v1/bots - Create a new chatbot
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createChatbotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const apiKeyEncrypted = data.apiKey ? encrypt(data.apiKey) : null;

  const [bot] = await db
    .insert(chatbots)
    .values({
      orgId: auth.org.id,
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
