import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateGoldenSet } from "@/lib/ai/golden-set";
import { z } from "zod";

const generateSchema = z.object({
  websiteUrl: z.string().url(),
});

// POST /api/v1/golden-set - Generate test questions from a website
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = generateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid URL", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await generateGoldenSet(parsed.data.websiteUrl);

  if (result.error) {
    return NextResponse.json(
      { error: result.error, pagesScanned: result.pagesScanned },
      { status: 422 }
    );
  }

  return NextResponse.json({
    tests: result.tests,
    pagesScanned: result.pagesScanned,
  });
}
