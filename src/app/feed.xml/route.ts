const POSTS = [
  { slug: "what-is-website-change-monitoring", title: "What is Website Change Monitoring and Why Your Business Needs It", desc: "The complete guide to tracking changes on any webpage and turning them into actionable insights." },
  { slug: "how-to-monitor-website-changes", title: "How to Monitor Any Website for Changes in 5 Minutes", desc: "Step-by-step tutorial from zero to your first alert with Zikit." },
  { slug: "5-ways-teams-use-website-monitoring", title: "5 Ways Teams Use Website Monitoring to Stay Ahead", desc: "Real use cases from competitor pricing intelligence to regulatory compliance." },
  { slug: "chrome-extension-website-monitoring", title: "How to Use a Chrome Extension to Monitor Any Website", desc: "One-click monitoring with visual CSS picker and badge alerts." },
  { slug: "ai-chat-assistant-for-website-changes", title: "Meet Camo: The AI Chat Assistant That Explains Website Changes", desc: "Ask questions about detected changes in plain English." },
  { slug: "api-integrations-telegram-slack-webhooks", title: "API and Integrations: Telegram, Slack, Discord, Webhooks", desc: "Connect Zikit to your workflow with REST API and messaging platforms." },
  { slug: "keyword-monitoring-css-selectors", title: "Keyword Monitoring and CSS Selectors: Track Exactly What Matters", desc: "Use keywords and CSS selectors to get alerted only when it matters." },
];

export async function GET() {
  const items = POSTS.map((p) => `    <item>
      <title>${p.title}</title>
      <link>https://zikit.ai/blog/${p.slug}</link>
      <description>${p.desc}</description>
      <pubDate>${new Date("2026-04-04").toUTCString()}</pubDate>
      <guid>https://zikit.ai/blog/${p.slug}</guid>
    </item>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Zikit Blog</title>
    <link>https://zikit.ai/blog</link>
    <description>Insights on website monitoring, competitor tracking, and AI-powered change detection.</description>
    <language>en</language>
    <atom:link href="https://zikit.ai/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
