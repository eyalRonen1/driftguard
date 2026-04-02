/**
 * Browser-based page fetcher using Playwright.
 * Used as fallback when regular HTTP fetch fails (Cloudflare, SPAs, etc.)
 *
 * NOTE: This requires playwright-core to be installed.
 * On Vercel serverless, use playwright-core + @playwright/browser-chromium.
 * For local dev, regular playwright works.
 */

import type { FetchResult } from "./fetcher";
import { createHash } from "crypto";

export async function fetchPageWithBrowser(
  url: string,
  options?: {
    waitForSelector?: string;
    timeoutMs?: number;
  }
): Promise<FetchResult & { screenshot?: Buffer }> {
  const start = Date.now();

  try {
    // Dynamic import to avoid breaking builds when playwright isn't installed
    const { chromium } = await import("playwright-core");

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      locale: "en-US",
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    // Navigate with timeout
    const timeout = options?.timeoutMs || 30000;
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout,
    });

    // Wait for optional selector
    if (options?.waitForSelector) {
      await page
        .waitForSelector(options.waitForSelector, { timeout: 10000 })
        .catch(() => {});
    }

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // Extract text content
    const text = await page.evaluate(() => {
      const body = document.body;
      if (!body) return "";
      // Remove scripts, styles, noscript
      const clone = body.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll("script, style, noscript, svg, iframe")
        .forEach((el) => el.remove());
      return clone.innerText?.replace(/\s+/g, " ").trim() || "";
    });

    // Get HTML
    const html = await page.content();

    // Take screenshot
    const screenshot = await page.screenshot({ type: "png", fullPage: false });

    const statusCode = response?.status() || 200;
    const responseTimeMs = Date.now() - start;
    const hash = createHash("sha256").update(text).digest("hex");

    await browser.close();

    return {
      text,
      html,
      hash,
      statusCode,
      responseTimeMs,
      contentLength: text.length,
      error:
        text.length < 50
          ? "Page content too short — may require JavaScript"
          : null,
      screenshot,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    const error =
      err instanceof Error ? err.message : "Browser fetch failed";

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

/**
 * Check if Playwright is available in this environment
 */
export async function isPlaywrightAvailable(): Promise<boolean> {
  try {
    await import("playwright-core");
    return true;
  } catch {
    return false;
  }
}
