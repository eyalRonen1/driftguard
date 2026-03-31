import { z } from "zod";

export const createMonitorSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  checkFrequency: z.enum(["15min", "hourly", "every_6h", "daily", "weekly"]).default("daily"),
  cssSelector: z.string().max(500).optional(),
  ignoreSelectors: z.string().max(1000).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  description: z.string().max(1000).optional(),
  tags: z.string().max(500).optional(),
});

export const updateMonitorSchema = createMonitorSchema.partial();
