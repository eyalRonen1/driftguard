/**
 * Page Fetcher - Fetches a URL and extracts clean text content.
 * HTTP-only, no headless browser.
 */

import { createHash } from "crypto";

export interface FetchResult {
  text: string;
  hash: string;
  statusCode: number;
  responseTimeMs: number;
  contentLength: number;
  error: string | null;
}

/**
 * Fetch a page and extract clean text content
 */
export async function fetchPage(
  url: string,
  options?: {
    cssSelector?: string | null;
    ignoreSelectors?: string | null;
    headers?: Record<string, string> | null;
    timeoutMs?: number;
  }
): Promise<FetchResult> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs || 15000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PageLifeguard/1.0; +https://pagelifeguard.com)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        ...(options?.headers || {}),
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;

    if (!response.ok) {
      return {
        text: "",
        hash: "",
        statusCode: response.status,
        responseTimeMs,
        contentLength: 0,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const text = extractText(html, options?.cssSelector, options?.ignoreSelectors);
    const hash = createHash("sha256").update(text).digest("hex");

    return {
      text,
      hash,
      statusCode: response.status,
      responseTimeMs,
      contentLength: text.length,
      error: null,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    const error =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Timeout"
          : err.message
        : "Unknown error";

    return {
      text: "",
      hash: "",
      statusCode: 0,
      responseTimeMs,
      contentLength: 0,
      error,
    };
  }
}

/**
 * Extract clean text from HTML, stripping noise
 */
function extractText(
  html: string,
  cssSelector?: string | null,
  ignoreSelectors?: string | null
): string {
  // Remove elements that are always noise
  let clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // If ignore selectors provided, try to remove matching elements
  if (ignoreSelectors) {
    const selectors = ignoreSelectors.split(",").map((s) => s.trim());
    for (const sel of selectors) {
      // Simple class/id-based removal
      if (sel.startsWith(".")) {
        const className = sel.slice(1);
        const regex = new RegExp(
          `<[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/[^>]+>`,
          "gi"
        );
        clean = clean.replace(regex, "");
      } else if (sel.startsWith("#")) {
        const id = sel.slice(1);
        const regex = new RegExp(
          `<[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/[^>]+>`,
          "gi"
        );
        clean = clean.replace(regex, "");
      }
    }
  }

  // If CSS selector targets a specific element, try to extract it
  if (cssSelector) {
    // Simple support for tag, .class, #id selectors
    let match: RegExpMatchArray | null = null;

    if (cssSelector.startsWith("#")) {
      const id = cssSelector.slice(1);
      const regex = new RegExp(
        `<[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/`,
        "i"
      );
      match = clean.match(regex);
    } else if (cssSelector.startsWith(".")) {
      const className = cssSelector.slice(1);
      const regex = new RegExp(
        `<[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/`,
        "i"
      );
      match = clean.match(regex);
    }

    if (match?.[1]) {
      clean = match[1];
    }
  }

  // Strip remaining HTML tags and normalize whitespace
  return clean
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
