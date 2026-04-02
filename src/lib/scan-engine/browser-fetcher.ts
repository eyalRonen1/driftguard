/**
 * Browser-based page fetcher using Puppeteer + @sparticuz/chromium-min.
 * Works on Vercel serverless (chromium-min fits under 50MB).
 * Falls back to local Chrome/Chromium for development.
 */

import type { FetchResult } from "./fetcher";
import { createHash } from "crypto";

// Remote chromium URL for @sparticuz/chromium-min (loaded on demand)
const CHROMIUM_REMOTE_URL =
  "https://github.com/nichochar/chromium-binaries/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

async function getBrowser() {
  // Try @sparticuz/chromium-min first (Vercel serverless)
  try {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    const executablePath = await chromium.executablePath(CHROMIUM_REMOTE_URL);

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath,
      headless: true,
    });
  } catch {
    // Fallback: try local puppeteer-core with system Chrome
    try {
      const puppeteer = (await import("puppeteer-core")).default;

      // Common Chrome paths
      const paths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      ];

      for (const p of paths) {
        try {
          return await puppeteer.launch({
            executablePath: p,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
          });
        } catch {
          continue;
        }
      }
    } catch {}

    throw new Error("No browser available");
  }
}

export async function fetchPageWithBrowser(
  url: string,
  options?: {
    waitForSelector?: string;
    timeoutMs?: number;
  }
): Promise<FetchResult & { screenshot?: Buffer }> {
  const start = Date.now();

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate
    const timeout = options?.timeoutMs || 30000;
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout,
    });

    // Wait for optional selector
    if (options?.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 10000 }).catch(() => {});
    }

    // Wait for dynamic content
    await new Promise((r) => setTimeout(r, 2000));

    // Extract text
    const text = await page.evaluate(() => {
      const body = document.body;
      if (!body) return "";
      const clone = body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("script, style, noscript, svg, iframe").forEach((el) => el.remove());
      return (clone as HTMLElement).innerText?.replace(/\s+/g, " ").trim() || "";
    });

    const html = await page.content();
    const screenshot = await page.screenshot({ type: "png", fullPage: false }) as Buffer;
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
      error: text.length < 50 ? "Page content too short" : null,
      screenshot,
    };
  } catch (err) {
    return {
      text: "",
      html: "",
      hash: "",
      statusCode: 0,
      responseTimeMs: Date.now() - start,
      contentLength: 0,
      error: err instanceof Error ? err.message : "Browser fetch failed",
    };
  }
}

export async function isPlaywrightAvailable(): Promise<boolean> {
  try {
    await import("@sparticuz/chromium-min");
    await import("puppeteer-core");
    return true;
  } catch {
    try {
      await import("puppeteer-core");
      return true;
    } catch {
      return false;
    }
  }
}
