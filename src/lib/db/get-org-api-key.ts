/**
 * Authenticate via API key (for Chrome Extension & external integrations).
 * Extracts Bearer token from Authorization header, hashes with SHA-256,
 * and looks up the api_keys table.
 */

import { db } from "@/lib/db";
import { apiKeys, users, organizations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function getAuthenticatedOrgFromApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer zk_")) return null;

  const rawKey = authHeader.slice(7); // remove "Bearer "
  const keyHash = hashApiKey(rawKey);

  const [keyRecord] = await db
    .select({
      keyId: apiKeys.id,
      orgId: apiKeys.orgId,
      userId: apiKeys.userId,
      isActive: apiKeys.isActive,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)))
    .limit(1);

  if (!keyRecord) return null;

  // Fetch user and org
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, keyRecord.userId))
    .limit(1);

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, keyRecord.orgId))
    .limit(1);

  if (!user || !org) return null;

  // Update lastUsedAt (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRecord.keyId))
    .catch(() => {});

  return { user, org };
}
