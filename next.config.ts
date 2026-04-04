import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: "upgrade-insecure-requests; default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.paddle.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https://api.openai.com https://*.supabase.co https://cdn.paddle.com https://*.paddle.com https://api.scrape.do https://va.vercel-scripts.com https://vitals.vercel-insights.com; frame-src https://cdn.paddle.com https://*.paddle.com https://buy.paddle.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
