/**
 * Activity logging — records user actions for audit trail.
 * Fire-and-forget: never blocks the main request.
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

type Action =
  | "monitor.create"
  | "monitor.update"
  | "monitor.delete"
  | "monitor.check"
  | "monitor.pause"
  | "monitor.resume"
  | "alert.save"
  | "alert.unsubscribe"
  | "alert.resubscribe"
  | "account.login"
  | "account.signup"
  | "account.delete"
  | "account.settings_update"
  | "export.csv"
  | "billing.upgrade"
  | "billing.cancel";

export function logActivity(params: {
  orgId: string;
  userEmail?: string;
  action: Action;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: Record<string, unknown>;
  ip?: string;
}) {
  // Fire-and-forget — don't await, don't block
  db.execute(sql`
    INSERT INTO activity_log (org_id, user_email, action, target_type, target_id, target_name, details, ip)
    VALUES (
      ${params.orgId},
      ${params.userEmail || null},
      ${params.action},
      ${params.targetType || null},
      ${params.targetId ? sql`${params.targetId}::uuid` : sql`NULL`},
      ${params.targetName || null},
      ${params.details ? sql`${JSON.stringify(params.details)}::jsonb` : sql`NULL`},
      ${params.ip || null}
    )
  `).catch(() => {
    // Silently fail — logging should never break the app
  });
}
