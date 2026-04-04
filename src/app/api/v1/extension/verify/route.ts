import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedOrgFromApiKey } from "@/lib/db/get-org-api-key";
import { PLAN_LIMITS } from "@/lib/billing/paddle";
import { rateLimit } from "@/lib/rate-limit";
import type { PlanCode } from "@/lib/billing/paddle";

function noCache(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

/** POST — Verify an API key and return org/plan info */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer zk_")) {
    return noCache(NextResponse.json({ valid: false, error: "Missing or invalid API key" }, { status: 401 }));
  }

  // Rate limit by IP (not by key snippet — prevents brute force across keys)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = await rateLimit(`apikey:verify:${ip}`, 10, 60000);
  if (!allowed) return noCache(NextResponse.json({ error: "Too many requests" }, { status: 429 }));

  const auth = await getAuthenticatedOrgFromApiKey(request);
  if (!auth) {
    return noCache(NextResponse.json({ valid: false, error: "Invalid or revoked API key" }, { status: 401 }));
  }

  const plan = (auth.org.plan || "free") as PlanCode;

  return noCache(NextResponse.json({
    valid: true,
    org: {
      id: auth.org.id,
      name: auth.org.name,
      plan,
    },
    user: {
      name: auth.user.name,
    },
    limits: PLAN_LIMITS[plan],
  }));
}
