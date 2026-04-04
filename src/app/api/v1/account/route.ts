import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import {
  users,
  organizations,
  monitors,
  snapshots,
  changes,
  alertConfigs,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/activity-log";

/**
 * DELETE /api/v1/account
 *
 * Permanently deletes the authenticated user's account and all associated data:
 *   1. Alert configs for org monitors
 *   2. Changes for org
 *   3. Snapshots for org monitors
 *   4. Monitors for org
 *   5. Organization
 *   6. User record
 *   7. Supabase auth session (sign out)
 */
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = await rateLimit(`account-delete:${authUser.id}`, 3, 3600000);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  try {
    // Find the user record
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.supabaseAuthId, authUser.id))
      .limit(1);

    if (!dbUser) {
      await supabase.auth.signOut();
      return NextResponse.json({ deleted: true });
    }

    // Log before deletion since the org gets deleted in the transaction
    const orgIds = (await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.ownerId, dbUser.id))).map(o => o.id);
    if (orgIds.length > 0) {
      logActivity({
        orgId: orgIds[0],
        userEmail: authUser.email,
        action: "account.delete",
        targetType: "user",
        targetId: dbUser.id,
      });
    }

    // Delete user in a transaction — cascade handles orgs→monitors→changes→snapshots→alerts
    await db.transaction(async (tx) => {
      const userOrgs = await tx.select({ id: organizations.id }).from(organizations).where(eq(organizations.ownerId, dbUser.id));
      const orgIds = userOrgs.map((o) => o.id);

      if (orgIds.length > 0) {
        const orgMonitors = await tx.select({ id: monitors.id }).from(monitors).where(inArray(monitors.orgId, orgIds));
        const monitorIds = orgMonitors.map((m) => m.id);

        if (monitorIds.length > 0) {
          await tx.delete(alertConfigs).where(inArray(alertConfigs.monitorId, monitorIds));
          await tx.delete(snapshots).where(inArray(snapshots.monitorId, monitorIds));
        }

        await tx.delete(changes).where(inArray(changes.orgId, orgIds));
        await tx.delete(alertConfigs).where(inArray(alertConfigs.orgId, orgIds));
        if (monitorIds.length > 0) await tx.delete(monitors).where(inArray(monitors.id, monitorIds));
        await tx.delete(organizations).where(inArray(organizations.id, orgIds));
      }

      await tx.delete(users).where(eq(users.id, dbUser.id));
    });

    // Only delete from Supabase Auth AFTER DB transaction succeeds
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabaseAdmin.auth.admin.deleteUser(authUser.id);
    await supabase.auth.signOut();

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    );
  }
}
