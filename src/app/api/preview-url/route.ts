import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { smartFetch } from "@/lib/scan-engine/fetcher";

/**
 * Public API endpoint - previews a URL for the landing page and dashboard.
 * Uses smartFetch (HTTP → Proxy → Browser) for maximum compatibility.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimit(`preview:${ip}`, 5, 60000);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const url = body.url;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const result = await smartFetch(url, { timeoutMs: 5000 });

    if (result.error && result.text.length === 0) {
      // Check if it's a bot-protection error
      if (result.error.includes("403") || result.error.includes("Forbidden") || result.error.includes("Blocked")) {
        return NextResponse.json(
          { error: `Page returned 403 Forbidden` },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 422 }
      );
    }

    // Extract title from HTML
    const titleMatch = result.html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "";

    const words = result.text.split(/\s+/).filter((w) => w.length > 0);

    return NextResponse.json({
      title,
      wordCount: words.length,
      preview: result.text.slice(0, 500),
      monitorable: true,
    });
  } catch (err) {
    const message = err instanceof Error && err.name === "AbortError"
      ? "Page took too long to respond"
      : "Failed to fetch URL. Please check the URL and try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
