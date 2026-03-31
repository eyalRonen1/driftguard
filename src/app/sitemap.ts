import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://driftguard-theta.vercel.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://driftguard-theta.vercel.app/login", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://driftguard-theta.vercel.app/signup", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
