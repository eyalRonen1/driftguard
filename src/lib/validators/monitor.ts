import { z } from "zod";

function isValidCSSSelector(sel: string): boolean {
  if (sel.length > 200) return false;
  if (/[{}]/.test(sel)) return false;
  if (/javascript:/i.test(sel)) return false;
  if (/expression\s*\(/i.test(sel)) return false;
  return /^[a-zA-Z0-9\s\-_.#\[\]='"~>+:*,()^$|@]+$/.test(sel);
}

export const createMonitorSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url().refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch { return false; }
  }, { message: "URL must use http or https" }),
  checkFrequency: z.enum(["15min", "hourly", "every_6h", "daily", "weekly"]).default("daily"),
  cssSelector: z.string().max(500).optional().refine((v) => !v || isValidCSSSelector(v), "Invalid CSS selector"),
  ignoreSelectors: z.string().max(1000).optional().refine((v) => !v || v.split(",").every(s => isValidCSSSelector(s.trim())), "Invalid selector"),
  headers: z.record(z.string(), z.string()).optional().refine((headers) => {
    if (!headers) return true;
    const blocked = ['host', 'authorization', 'cookie', 'set-cookie', 'proxy-authorization', 'x-forwarded-for', 'x-forwarded-host', 'x-real-ip'];
    return !Object.keys(headers).some(k => blocked.includes(k.toLowerCase()));
  }, { message: "Contains blocked header names" }),
  description: z.string().max(1000).optional(),
  tags: z.string().max(500).optional(),
  useCase: z.enum(["competitor", "regulatory", "ecommerce", "jobs", "content", "custom"]).optional(),
  watchKeywords: z.string().max(500).optional(),
  keywordMode: z.enum(["any", "appear", "disappear"]).optional(),
  preferredCheckHour: z.number().int().min(0).max(23).nullable().optional(),
  preferredCheckDay: z.number().int().min(0).max(6).nullable().optional(),
});

export const updateMonitorSchema = createMonitorSchema.partial().extend({
  isPaused: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
