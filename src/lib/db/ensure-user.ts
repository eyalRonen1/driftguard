/**
 * Ensures a Supabase Auth user has a corresponding DB user + organization.
 * Called on every dashboard load. Creates records if they don't exist.
 */

import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

export async function ensureUserAndOrg(authUser: User) {
  // Check if user exists in our DB
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.supabaseAuthId, authUser.id))
    .limit(1);

  if (existingUser) {
    // User exists, check if they have an org
    const [existingOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, existingUser.id))
      .limit(1);

    if (existingOrg) return { user: existingUser, org: existingOrg };

    // Create org for existing user
    const [org] = await db
      .insert(organizations)
      .values({
        name: authUser.user_metadata?.full_name
          ? `${authUser.user_metadata.full_name}'s Workspace`
          : "My Workspace",
        slug: `ws-${existingUser.id.slice(0, 8)}`,
        ownerId: existingUser.id,
        quotaResetAt: getNextMonthStart(),
      })
      .returning();

    return { user: existingUser, org };
  }

  // Create new user
  const [newUser] = await db
    .insert(users)
    .values({
      email: authUser.email!,
      name: authUser.user_metadata?.full_name || null,
      avatarUrl: authUser.user_metadata?.avatar_url || null,
      supabaseAuthId: authUser.id,
    })
    .returning();

  // Create default org
  const [org] = await db
    .insert(organizations)
    .values({
      name: authUser.user_metadata?.full_name
        ? `${authUser.user_metadata.full_name}'s Workspace`
        : "My Workspace",
      slug: `ws-${newUser.id.slice(0, 8)}`,
      ownerId: newUser.id,
      quotaResetAt: getNextMonthStart(),
    })
    .returning();

  return { user: newUser, org };
}

function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
