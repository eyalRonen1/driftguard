/**
 * Page Fetcher - Fetches a URL and extracts clean text content.
 * Tier 1: HTTP fetch (fast, cheap).
 * Tier 2: Playwright browser fallback via smartFetch (slow, for Cloudflare/SPAs).
 */

import { createHash } from "crypto";
import dns from "dns";
import { fetchPageWithBrowser, isPlaywrightAvailable } from "./browser-fetcher";

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
  url: string,
  opts?: { isRedirect?: boolean }
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

  // 4. Resolve hostname and check resulting IP against private ranges (with timeout)
  try {
    const dnsResult = await Promise.race([
      dns.promises.lookup(hostname),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DNS timeout")), 2000)),
    ]);
    if (isPrivateIp(dnsResult.address)) {
      return { ok: false, reason: "URL resolves to a private/internal IP address" };
    }
  } catch (err) {
    // DNS timeout or failure — allow the request (proxy will handle it if HTTP fails)
    if (err instanceof Error && err.message === "DNS timeout") {
      return { ok: true }; // Let it through, proxy will catch blocked sites
    }
    // For redirect targets, allow DNS failures — the initial URL was already validated,
    // and redirect targets (CDN hostnames etc.) may have transient DNS issues
    if (opts?.isRedirect) {
      return { ok: true };
    }
    return { ok: false, reason: "Could not resolve hostname" };
  }

  return { ok: true };
}

// ── User-Agent Rotation ─────────────────────────────────────────────

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
];

function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
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
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs || 5000);

    let currentUrl = url;
    let response: Response | undefined;

    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      response = await fetch(currentUrl, {
        headers: {
          "User-Agent": getRandomUA(),
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "max-age=0",
          "Sec-Ch-Ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"macOS"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
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
      const redirectValidation = await validateUrl(redirectUrl, { isRedirect: true });
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

    const statusCode = response.status;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // JSON API response
      const json = await response.text();
      const text = JSON.stringify(JSON.parse(json), null, 2); // pretty-print for readable diffs
      const hash = createHash("sha256").update(text).digest("hex");
      return { text, html: json, hash, statusCode, responseTimeMs, contentLength: text.length, error: null };
    }

    if (contentType.includes("application/pdf")) {
      // PDF document — extract text if possible, otherwise hash the binary
      const buffer = await response.arrayBuffer();
      const hash = createHash("sha256").update(Buffer.from(buffer)).digest("hex");
      let text = `[PDF document, ${buffer.byteLength} bytes]`;

      try {
        // Try to extract text from PDF (pdf-parse v2 class-based API)
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        if (result.text) {
          text = result.text.replace(/\s+/g, " ").trim() || text;
        }
        await parser.destroy();
      } catch {
        // pdf-parse not available or failed, use hash-only monitoring
      }

      return { text, html: "", hash, statusCode, responseTimeMs, contentLength: buffer.byteLength, error: null };
    }

    if (contentType.includes("application/rss") || contentType.includes("application/atom") || contentType.includes("text/xml") || contentType.includes("application/xml")) {
      const xml = await response.text();

      // Check if it's actually an RSS/Atom feed
      if (xml.includes("<rss") || xml.includes("<feed") || xml.includes("<channel>")) {
        // Extract items/entries for readable comparison
        const items: string[] = [];
        const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
        let match;
        while ((match = itemRegex.exec(xml)) !== null) {
          const titleMatch = match[1].match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
          const linkMatch = match[1].match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i) || match[1].match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i);
          const descMatch = match[1].match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/i) || match[1].match(/<(?:summary|content)[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/(?:summary|content)>/i);

          const title = titleMatch?.[1]?.trim() || "";
          const link = linkMatch?.[1]?.trim() || "";
          const desc = descMatch?.[1]?.replace(/<[^>]+>/g, "").trim().slice(0, 200) || "";

          if (title) items.push(`${title}\n${link}\n${desc}`);
        }

        const text = items.join("\n\n---\n\n") || xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const hash = createHash("sha256").update(text).digest("hex");
        return { text, html: xml, hash, statusCode, responseTimeMs, contentLength: text.length, error: null };
      }

      // Regular XML — treat as HTML using already-read content
      const text = extractText(xml, options?.cssSelector, options?.ignoreSelectors);
      const hash = createHash("sha256").update(text).digest("hex");
      return { text, html: xml, hash, statusCode, responseTimeMs, contentLength: text.length, error: null };
    }

    // Default: HTML content
    const html = await response.text();
    const text = extractText(html, options?.cssSelector, options?.ignoreSelectors);
    const hash = createHash("sha256").update(text).digest("hex");

    return {
      text,
      html,
      hash,
      statusCode,
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

// ── Smart Fetch (two-tier: HTTP → Browser fallback) ─────────────────

/**
 * Smart fetch: tries HTTP first, falls back to browser for blocked/JS-heavy sites.
 */
export async function smartFetch(
  url: string,
  options?: {
    cssSelector?: string | null;
    ignoreSelectors?: string | null;
    headers?: Record<string, string> | null;
    timeoutMs?: number;
    forceBrowser?: boolean;
  }
): Promise<FetchResult> {
  // Clean tracking parameters to reduce URL noise
  try {
    const parsed = new URL(url);
    const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_campaignid", "gclid", "gad_source", "gad_campaignid", "dclid", "fbclid", "msclkid"];
    let cleaned = false;
    trackingParams.forEach((p) => { if (parsed.searchParams.has(p)) { parsed.searchParams.delete(p); cleaned = true; } });
    if (cleaned) url = parsed.toString();
  } catch {}

  // If explicitly forced to use browser
  if (options?.forceBrowser) {
    const browserAvailable = await isPlaywrightAvailable();
    if (browserAvailable) {
      return fetchPageWithBrowser(url, { timeoutMs: options?.timeoutMs });
    }
  }

  // ── Tier 1: Regular HTTP (short timeout so proxy has time) ──
  const hasProxy = !!(process.env.SCRAPE_DO_TOKEN || process.env.SCRAPING_API_KEY);
  const result = await fetchPage(url, { ...options, timeoutMs: hasProxy ? 3000 : (options?.timeoutMs || 5000) });

  const isBlocked =
    result.error?.includes("403") ||
    result.error?.includes("401") ||
    result.error?.includes("429") ||
    result.error?.includes("503") ||
    result.error?.includes("Blocked") ||
    result.error?.includes("Forbidden") ||
    (result.statusCode >= 400 && result.text.length < 100);

  // Page returned HTML but extracted text is tiny = JS rendering needed (e.g. SPA shell)
  const isJsOnly = (result.text.length < 500 && result.statusCode === 200 && result.html.length > 1000);

  // Connection-refused sites are genuinely unreachable — don't waste proxy credits
  const isConnectionRefused = result.statusCode === 0 && (
    result.error?.includes("ECONNREFUSED") ||
    result.error?.includes("ECONNRESET") ||
    result.error?.includes("ENETUNREACH")
  );

  if (!isBlocked && !isJsOnly) {
    return result; // Tier 1 succeeded
  }

  // ── Tier 2: Scraping proxy (fast, works on serverless) ──
  // Try proxy BEFORE browser — proxy is faster and works within Vercel's 10s timeout
  // Don't try proxy for connection-refused sites — they're genuinely unreachable
  if (isBlocked && !isConnectionRefused && (process.env.SCRAPE_DO_TOKEN || process.env.SCRAPING_API_KEY)) {
    const proxyResult = await fetchViaProxy(url);
    if (!proxyResult.error && proxyResult.text.length > 50) {
      return proxyResult;
    }
    // If proxy got content but less than 50 chars, still return it if better than nothing
    if (proxyResult.text.length > 0 && !proxyResult.error) {
      return proxyResult;
    }
  }

  // ── Tier 3: Headless browser (last resort, needs long timeout) ──
  if (isBlocked || isJsOnly) {
    const browserAvailable = await isPlaywrightAvailable();
    if (browserAvailable) {
      console.log(`[smartFetch] Tier 3: browser fallback for ${url}`);
      const browserResult = await fetchPageWithBrowser(url, {
        timeoutMs: options?.timeoutMs || 30000,
      });
      if (!browserResult.error && browserResult.text.length > result.text.length) {
        return browserResult;
      }
    }
  }

  return result;
}

/**
 * Fetch via scraping proxy service (Tier 3 fallback).
 * Handles Cloudflare/IP-blocked sites using residential proxies.
 * Supports: Scrape.do (SCRAPE_DO_TOKEN) or ScrapingBee (SCRAPING_API_KEY).
 * Free tier: 1000 requests/month, no credit card needed.
 */
async function fetchViaProxy(url: string): Promise<FetchResult> {
  const scrapeDoToken = process.env.SCRAPE_DO_TOKEN;
  const scrapingBeeKey = process.env.SCRAPING_API_KEY;

  if (!scrapeDoToken && !scrapingBeeKey) {
    return { text: "", html: "", hash: "", statusCode: 0, responseTimeMs: 0, contentLength: 0, error: "No proxy configured" };
  }

  const start = Date.now();

  if (scrapeDoToken) {
    // Scrape.do: try regular proxy first (1 credit), then super (5 credits) if it fails
    for (const superMode of [false, true]) {
      try {
        const proxyUrl = `https://api.scrape.do/?token=${scrapeDoToken}&url=${encodeURIComponent(url)}${superMode ? "&super=true" : ""}`;
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(7000) });

        if (res.ok) {
          const html = await res.text();
          if (html.length > 100) {
            const responseTimeMs = Date.now() - start;
            const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            const hash = createHash("sha256").update(text).digest("hex");
            console.log(`[proxy] ${url} succeeded with ${superMode ? "super" : "regular"} proxy`);
            return { text, html, hash, statusCode: 200, responseTimeMs, contentLength: text.length, error: null };
          }
        }

        if (!superMode) {
          console.log(`[proxy] Regular proxy failed for ${url}, trying super...`);
          continue;
        }
      } catch {
        if (!superMode) continue;
      }
    }

    return { text: "", html: "", hash: "", statusCode: 0, responseTimeMs: Date.now() - start, contentLength: 0, error: "Proxy failed after both regular and super attempts" };
  }

  // ScrapingBee fallback
  try {
    const proxyUrl = `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeKey}&url=${encodeURIComponent(url)}&render_js=false&premium_proxy=true`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(7000) });
    const responseTimeMs = Date.now() - start;

    if (!res.ok) {
      return { text: "", html: "", hash: "", statusCode: res.status, responseTimeMs, contentLength: 0, error: `Proxy returned ${res.status}` };
    }

    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const hash = createHash("sha256").update(text).digest("hex");
    return { text, html, hash, statusCode: 200, responseTimeMs, contentLength: text.length, error: null };
  } catch (err) {
    return { text: "", html: "", hash: "", statusCode: 0, responseTimeMs: Date.now() - start, contentLength: 0, error: err instanceof Error ? err.message : "Proxy failed" };
  }
}
