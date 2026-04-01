/**
 * Page Fetcher - Fetches a URL and extracts clean text content.
 * HTTP-only, no headless browser.
 */

import { createHash } from "crypto";
import dns from "dns";

// ── SSRF Protection ──────────────────────────────────────────────────

const PRIVATE_IP_RANGES = [
  // IPv4 private/reserved ranges
  /^127\./,                          // 127.0.0.0/8 loopback
  /^10\./,                           // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
  /^169\.254\./,                     // 169.254.0.0/16 link-local / AWS metadata
  /^0\./,                            // 0.0.0.0/8
  // IPv6
  /^::1$/,                           // loopback
  /^fc/i,                            // fc00::/7 unique local
  /^fd/i,                            // fd00::/8 unique local
  /^fe80/i,                          // link-local
  /^::$/,                            // unspecified
  /^::ffff:(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.|0\.)/,  // IPv4-mapped
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((re) => re.test(ip));
}

/**
 * Validate a URL for SSRF safety.
 * Blocks private/internal IPs, non-http(s) schemes, and common bypass notations.
 */
export async function validateUrl(
  url: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }

  // 1. Scheme must be http or https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Only http and https URLs are allowed" };
  }

  const hostname = parsed.hostname;

  // 2. Block obvious hostname strings (localhost, .internal, .local, etc.)
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".local")
  ) {
    return { ok: false, reason: "Internal hostnames are not allowed" };
  }

  // 3. Block common numeric bypass patterns before DNS resolution
  //    - Octal: 0177.0.0.1
  //    - Decimal: 2130706433
  //    - Hex: 0x7f.0.0.1 or 0x7f000001
  if (/^0[0-7]+(\.|$)/.test(hostname)) {
    return { ok: false, reason: "Octal IP notation is not allowed" };
  }
  if (/^0x[0-9a-f]/i.test(hostname)) {
    return { ok: false, reason: "Hex IP notation is not allowed" };
  }
  if (/^\d+$/.test(hostname)) {
    // Pure decimal integer IP (e.g. 2130706433)
    const num = Number(hostname);
    if (num >= 0 && num <= 0xffffffff) {
      return { ok: false, reason: "Decimal IP notation is not allowed" };
    }
  }

  // 4. Resolve hostname and check resulting IP against private ranges
  try {
    const { address } = await dns.promises.lookup(hostname);
    if (isPrivateIp(address)) {
      return { ok: false, reason: "URL resolves to a private/internal IP address" };
    }
  } catch {
    return { ok: false, reason: "Could not resolve hostname" };
  }

  return { ok: true };
}

// Maximum number of redirects we will follow manually
const MAX_REDIRECTS = 5;

export interface FetchResult {
  text: string;
  html: string;
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

  // ── SSRF validation ────────────────────────────────────────────────
  const validation = await validateUrl(url);
  if (!validation.ok) {
    return {
      text: "",
      html: "",
      hash: "",
      statusCode: 0,
      responseTimeMs: Date.now() - start,
      contentLength: 0,
      error: `Blocked: ${validation.reason}`,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs || 15000);

    let currentUrl = url;
    let response: Response | undefined;

    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      response = await fetch(currentUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Zikit/1.0; +https://zikit.ai)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
          ...(options?.headers || {}),
        },
        signal: controller.signal,
        redirect: "manual",
      });

      // If not a redirect, we're done
      if (response.status < 300 || response.status >= 400) break;

      // Handle redirect: validate the target before following
      const location = response.headers.get("location");
      if (!location) break;

      const redirectUrl = new URL(location, currentUrl).toString();
      const redirectValidation = await validateUrl(redirectUrl);
      if (!redirectValidation.ok) {
        clearTimeout(timeout);
        return {
          text: "",
          html: "",
          hash: "",
          statusCode: response.status,
          responseTimeMs: Date.now() - start,
          contentLength: 0,
          error: `Redirect blocked: ${redirectValidation.reason}`,
        };
      }

      currentUrl = redirectUrl;

      if (redirects === MAX_REDIRECTS) {
        clearTimeout(timeout);
        return {
          text: "",
          html: "",
          hash: "",
          statusCode: response.status,
          responseTimeMs: Date.now() - start,
          contentLength: 0,
          error: "Too many redirects",
        };
      }
    }

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;

    if (!response || !response.ok) {
      return {
        text: "",
        html: "",
        hash: "",
        statusCode: response?.status ?? 0,
        responseTimeMs,
        contentLength: 0,
        error: `HTTP ${response?.status}: ${response?.statusText}`,
      };
    }

    const html = await response.text();
    const text = extractText(html, options?.cssSelector, options?.ignoreSelectors);
    const hash = createHash("sha256").update(text).digest("hex");

    return {
      text,
      html,
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
      html: "",
      hash: "",
      statusCode: 0,
      responseTimeMs,
      contentLength: 0,
      error,
    };
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        const className = escapeRegex(sel.slice(1));
        const regex = new RegExp(
          `<[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/[^>]+>`,
          "gi"
        );
        clean = clean.replace(regex, "");
      } else if (sel.startsWith("#")) {
        const id = escapeRegex(sel.slice(1));
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
      const id = escapeRegex(cssSelector.slice(1));
      const regex = new RegExp(
        `<[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/`,
        "i"
      );
      match = clean.match(regex);
    } else if (cssSelector.startsWith(".")) {
      const className = escapeRegex(cssSelector.slice(1));
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
