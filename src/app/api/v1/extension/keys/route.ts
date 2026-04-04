import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedOrg } from "@/lib/db/get-org";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import { rateLimit } from "@/lib/rate-limit";

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** GET — List API keys for current org (prefix + name only, never full key) */
export async function GET() {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      isActive: apiKeys.isActive,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.orgId, auth.org.id), eq(apiKeys.isActive, true)))
    .orderBy(apiKeys.createdAt);

  return NextResponse.json({ keys });
}

/** POST — Generate a new API key (returns full key once) */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if this is an internal extension auto-auth (skip plan check) or manual creation
  const referer = request.headers.get("referer") || "";
  const isExtensionAuth = referer.includes("/auth/extension");

  // Manual API key creation requires Business plan
  if (!isExtensionAuth && auth.org.plan !== "business") {
    return NextResponse.json({ error: "API keys require a Business plan. Upgrade to unlock API access." }, { status: 403 });
  }

  const { allowed } = await rateLimit(`apikey:create:${auth.user.id}`, 5, 3600000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // Max 3 keys per org
  const existing = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(and(eq(apiKeys.orgId, auth.org.id), eq(apiKeys.isActive, true)));

  if (existing.length >= 3) {
    return NextResponse.json({ error: "Maximum 3 API keys per account. Revoke an existing key first." }, { status: 400 });
  }

  // Generate key: zk_live_<32 hex chars>
  const randomPart = randomBytes(16).toString("hex");
  const fullKey = `zk_live_${randomPart}`;
  const keyPrefix = `zk_${randomPart.slice(0, 4)}`;
  const keyHash = hashApiKey(fullKey);

  const body = await new Response(null).text().catch(() => ""); // handle optional body
  let name = "Chrome Extension";
  try {
    const parsed = await new Request("http://x", { method: "POST" }).text();
    // Try to get name from request body if provided
  } catch {}

  const [created] = await db
    .insert(apiKeys)
    .values({
      orgId: auth.org.id,
      userId: auth.user.id,
      name,
      keyPrefix,
      keyHash,
    })
    .returning({ id: apiKeys.id, createdAt: apiKeys.createdAt });

  return NextResponse.json({
    id: created.id,
    key: fullKey, // shown once, never stored in plaintext
    keyPrefix,
    name,
    createdAt: created.createdAt,
  }, { status: 201 });
}

/** DELETE — Revoke an API key by ID */
export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedOrg();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");
  if (!keyId) return NextResponse.json({ error: "Missing key ID" }, { status: 400 });

  const [revoked] = await db
    .update(apiKeys)
    .set({ isActive: false })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.orgId, auth.org.id)))
    .returning({ id: apiKeys.id });

  if (!revoked) return NextResponse.json({ error: "Key not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
