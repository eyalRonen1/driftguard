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
      // User has auth but no DB record -- just sign out
      await supabase.auth.signOut();
      return NextResponse.json({ deleted: true });
    }

    // Find organizations owned by this user
    const userOrgs = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.ownerId, dbUser.id));

    const orgIds = userOrgs.map((o) => o.id);

    if (orgIds.length > 0) {
      // Find all monitors in those orgs
      const orgMonitors = await db
        .select({ id: monitors.id })
        .from(monitors)
        .where(inArray(monitors.orgId, orgIds));

      const monitorIds = orgMonitors.map((m) => m.id);

      if (monitorIds.length > 0) {
        // Delete alert configs for these monitors
        await db
          .delete(alertConfigs)
          .where(inArray(alertConfigs.monitorId, monitorIds));

        // Delete snapshots for these monitors
        await db
          .delete(snapshots)
          .where(inArray(snapshots.monitorId, monitorIds));
      }

      // Delete changes for these orgs
      await db.delete(changes).where(inArray(changes.orgId, orgIds));

      // Delete org-level alert configs (those without a specific monitor)
      await db.delete(alertConfigs).where(inArray(alertConfigs.orgId, orgIds));

      // Delete monitors
      if (monitorIds.length > 0) {
        await db.delete(monitors).where(inArray(monitors.id, monitorIds));
      }

      // Delete organizations
      await db.delete(organizations).where(inArray(organizations.id, orgIds));
    }

    // Delete user record
    await db.delete(users).where(eq(users.id, dbUser.id));

    // Delete the Supabase Auth user using admin API
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabaseAdmin.auth.admin.deleteUser(authUser.id);

    // Sign out the Supabase session
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
