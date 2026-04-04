import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // Core pages
    { url: "https://zikit.ai", lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: "https://zikit.ai/login", lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://zikit.ai/signup", lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://zikit.ai/about", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://zikit.ai/docs", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: "https://zikit.ai/integrations", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://zikit.ai/integrations/openclaw", lastModified: now, changeFrequency: "monthly", priority: 0.5 },

    // Blog
    { url: "https://zikit.ai/blog", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://zikit.ai/blog/what-is-website-change-monitoring", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://zikit.ai/blog/how-to-monitor-website-changes", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://zikit.ai/blog/5-ways-teams-use-website-monitoring", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://zikit.ai/blog/chrome-extension-website-monitoring", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://zikit.ai/blog/ai-chat-assistant-for-website-changes", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://zikit.ai/blog/api-integrations-telegram-slack-webhooks", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://zikit.ai/blog/keyword-monitoring-css-selectors", lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Legal
    { url: "https://zikit.ai/terms", lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: "https://zikit.ai/privacy", lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: "https://zikit.ai/refund", lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: "https://zikit.ai/accessibility", lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
