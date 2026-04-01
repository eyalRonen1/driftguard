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
    // User exists, ensure they have an org
    const org = await ensureOrg(existingUser.id, authUser);
    return { user: existingUser, org };
  }

  // Create new user, handling concurrent signup race condition
  let newUser;
  try {
    const [inserted] = await db
      .insert(users)
      .values({
        email: authUser.email!,
        name: authUser.user_metadata?.full_name || null,
        avatarUrl: authUser.user_metadata?.avatar_url || null,
        supabaseAuthId: authUser.id,
      })
      .returning();
    newUser = inserted;
  } catch (err: any) {
    // If unique constraint violation, the other request won the race
    if (err?.code === "23505") {
      const [raceWinner] = await db
        .select()
        .from(users)
        .where(eq(users.supabaseAuthId, authUser.id))
        .limit(1);
      if (raceWinner) {
        const org = await ensureOrg(raceWinner.id, authUser);
        return { user: raceWinner, org };
      }
    }
    throw err;
  }

  // Create default org
  const org = await ensureOrg(newUser.id, authUser);
  return { user: newUser, org };
}

/**
 * Ensures an organization exists for the given user, handling concurrent creation.
 */
async function ensureOrg(userId: string, authUser: User) {
  const [existingOrg] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.ownerId, userId))
    .limit(1);

  if (existingOrg) return existingOrg;

  try {
    const [org] = await db
      .insert(organizations)
      .values({
        name: authUser.user_metadata?.full_name
          ? `${authUser.user_metadata.full_name}'s Workspace`
          : "My Workspace",
        slug: `ws-${userId.slice(0, 8)}`,
        ownerId: userId,
        quotaResetAt: getNextMonthStart(),
      })
      .returning();
    return org;
  } catch (err: any) {
    // If unique constraint violation on slug, re-fetch the org
    if (err?.code === "23505") {
      const [raceOrg] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.ownerId, userId))
        .limit(1);
      if (raceOrg) return raceOrg;
    }
    throw err;
  }
}

function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
