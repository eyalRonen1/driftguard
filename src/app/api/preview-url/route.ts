import { NextRequest, NextResponse } from "next/server";

/**
 * Public API endpoint - previews a URL for the landing page live checker.
 * No auth required. Rate limited by simple check.
 */
export async function POST(request: NextRequest) {
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
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PageLifeguard/1.0; +https://pagelifeguard.com)",
        Accept: "text/html",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Page returned ${response.status} ${response.statusText}` },
        { status: 422 }
      );
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "";

    // Extract text
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const words = text.split(/\s+/).filter((w) => w.length > 0);

    return NextResponse.json({
      title,
      wordCount: words.length,
      preview: text.slice(0, 500),
      monitorable: true,
    });
  } catch (err) {
    const message = err instanceof Error
      ? err.name === "AbortError" ? "Page took too long to respond" : err.message
      : "Could not reach this URL";

    return NextResponse.json({ error: message }, { status: 422 });
  }
}
