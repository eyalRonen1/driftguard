import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { validateUrl } from "@/lib/scan-engine/fetcher";

/**
 * Public API endpoint - previews a URL for the landing page live checker.
 * Rate limited + SSRF protection.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 5 previews per minute per IP
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

  // SSRF protection via shared validator
  const validation = await validateUrl(url);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let currentUrl = url;
    let response: Response | undefined;
    const maxRedirects = 5;

    for (let i = 0; i <= maxRedirects; i++) {
      response = await fetch(currentUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Zikit/1.0; +https://zikit.ai)",
          Accept: "text/html",
        },
        signal: controller.signal,
        redirect: "manual",
      });

      if (response.status < 300 || response.status >= 400) break;

      const location = response.headers.get("location");
      if (!location) break;

      const redirectUrl = new URL(location, currentUrl).toString();
      const redirectCheck = await validateUrl(redirectUrl);
      if (!redirectCheck.ok) {
        clearTimeout(timeout);
        return NextResponse.json({ error: `Redirect blocked: ${redirectCheck.reason}` }, { status: 400 });
      }
      currentUrl = redirectUrl;

      if (i === maxRedirects) {
        clearTimeout(timeout);
        return NextResponse.json({ error: "Too many redirects" }, { status: 422 });
      }
    }

    clearTimeout(timeout);

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: `Page returned ${response?.status ?? 0} ${response?.statusText ?? "Unknown"}` },
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
    const message = err instanceof Error && err.name === "AbortError"
      ? "Page took too long to respond"
      : "Failed to fetch URL. Please check the URL and try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
