import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : null;
  if (!name) return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  // Update name in Supabase auth
  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update timezone in org if provided
  const timezone = typeof body.timezone === "string" ? body.timezone : null;
  if (timezone && isValidTimezone(timezone)) {
    try {
      const { org } = await ensureUserAndOrg(user);
      await db.update(organizations).set({ timezone }).where(eq(organizations.id, org.id));
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
