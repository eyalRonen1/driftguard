/**
 * Shared helper to get the authenticated user's organization.
 * Auto-creates user + org if they don't exist (for API routes).
 */

import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ensureUserAndOrg } from "./ensure-user";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getAuthenticatedOrg(): Promise<{
  user: typeof users.$inferSelect;
  org: typeof organizations.$inferSelect;
  authUser: User;
} | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { user, org } = await ensureUserAndOrg(authUser);
  return { user, org, authUser };
}
