/**
 * Page Screenshot Capture - Takes a screenshot of a URL.
 * Uses puppeteer-core with chromium-min for serverless.
 * Falls back gracefully if chromium unavailable.
 */

export interface ScreenshotResult {
  buffer: Buffer | null;
  width: number;
  height: number;
  error: string | null;
}

export async function captureScreenshot(url: string): Promise<ScreenshotResult> {
  try {
    // Dynamic imports to avoid breaking build if not available
    const puppeteer = await import("puppeteer-core");

    let executablePath: string;
    let args: string[] = [];

    try {
      // Try serverless chromium first
      const chromium = await import("@sparticuz/chromium-min");
      executablePath = await chromium.default.executablePath(
        "https://github.com/nichochar/chromium-binaries/releases/download/v131.0.0/chromium-v131.0.0-pack.tar"
      );
      args = chromium.default.args;
    } catch {
      // Fallback to local Chrome
      const paths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      ];

      const fs = await import("fs");
      executablePath = paths.find((p) => fs.existsSync(p)) || "";

      if (!executablePath) {
        return { buffer: null, width: 0, height: 0, error: "No Chrome/Chromium found" };
      }
    }

    const browser = await puppeteer.default.launch({
      executablePath,
      args: [...args, "--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

    // Wait a bit for dynamic content
    await new Promise((r) => setTimeout(r, 1000));

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false, // viewport only for consistency
    });

    await browser.close();

    return {
      buffer: Buffer.from(screenshot),
      width: 1280,
      height: 800,
      error: null,
    };
  } catch (err) {
    return {
      buffer: null,
      width: 0,
      height: 0,
      error: err instanceof Error ? err.message : "Screenshot failed",
    };
  }
}
