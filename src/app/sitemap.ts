import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://zikit.ai", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://zikit.ai/login", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://zikit.ai/signup", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
