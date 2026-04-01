import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Public API endpoint - previews a URL for the landing page live checker.
 * Rate limited + SSRF protection.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 5 previews per minute per IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(`preview:${ip}`, 5, 60000);
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
    const parsed = new URL(url);
    // SSRF protection: block private/internal URLs
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" ||
        hostname.startsWith("10.") || hostname.startsWith("172.") || hostname.startsWith("192.168.") ||
        hostname.endsWith(".internal") || hostname.endsWith(".local") ||
        parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }
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
