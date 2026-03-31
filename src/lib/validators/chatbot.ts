import { z } from "zod";

export const createChatbotSchema = z.object({
  name: z.string().min(1).max(255),
  connectionType: z.enum(["api_endpoint", "custom_webhook"]),
  endpointUrl: z.string().url(),
  apiKey: z.string().optional(),
  requestTemplate: z
    .object({
      method: z.enum(["POST", "GET"]).default("POST"),
      body: z.string().optional(), // JSON template with {{question}} placeholder
      contentType: z.string().default("application/json"),
    })
    .optional(),
  responsePath: z.string().optional(), // JSONPath to extract answer
  headers: z.record(z.string(), z.string()).optional(),
  scanFrequency: z.enum(["hourly", "every_6h", "daily", "weekly", "manual"]).default("daily"),
  timeoutMs: z.number().min(5000).max(120000).default(30000),
  scanDelayMs: z.number().min(500).max(10000).default(1500),
  websiteUrl: z.string().url().optional(),
  description: z.string().max(1000).optional(),
});

export const updateChatbotSchema = createChatbotSchema.partial();

export const createTestCaseSchema = z.object({
  question: z.string().min(1).max(5000),
  expectedAnswer: z.string().min(1).max(10000),
  category: z.string().max(100).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  matchStrategy: z
    .enum(["semantic", "contains", "exact", "regex", "not_contains"])
    .default("semantic"),
  semanticThreshold: z.number().min(0).max(1).default(0.7),
});

export const updateTestCaseSchema = createTestCaseSchema.partial();

export const triggerScanSchema = z.object({
  chatbotId: z.string().uuid(),
  triggerType: z.enum(["manual", "scheduled", "api"]).default("manual"),
});
