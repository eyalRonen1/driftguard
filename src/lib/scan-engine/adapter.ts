/**
 * Chatbot Adapter - Sends a question to a chatbot endpoint and extracts the answer.
 * MVP supports: api_endpoint and custom_webhook connection types.
 */

import { decrypt } from "@/lib/crypto";

export interface ChatbotConfig {
  connectionType: string;
  endpointUrl: string | null;
  apiKeyEncrypted: string | null;
  requestTemplate: { method?: string; body?: string; contentType?: string } | null;
  responsePath: string | null;
  headers: Record<string, string> | null;
  timeoutMs: number;
}

export interface AdapterResult {
  answer: string | null;
  latencyMs: number;
  error: string | null;
  rawResponse: unknown;
}

/**
 * Send a question to a chatbot and get the response
 */
export async function askChatbot(
  config: ChatbotConfig,
  question: string
): Promise<AdapterResult> {
  const start = Date.now();

  try {
    if (!config.endpointUrl) {
      return { answer: null, latencyMs: 0, error: "No endpoint URL configured", rawResponse: null };
    }

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": config.requestTemplate?.contentType || "application/json",
      ...(config.headers || {}),
    };

    // Add API key as Bearer token if configured
    if (config.apiKeyEncrypted) {
      const apiKey = decrypt(config.apiKeyEncrypted);
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    // Build request body using template
    let body: string;
    if (config.requestTemplate?.body) {
      body = config.requestTemplate.body.replace(/\{\{question\}\}/g, question);
    } else {
      body = JSON.stringify({ message: question });
    }

    const method = config.requestTemplate?.method || "POST";

    // Make the request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    const response = await fetch(config.endpointUrl, {
      method,
      headers,
      body: method !== "GET" ? body : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        answer: null,
        latencyMs,
        error: `HTTP ${response.status}: ${response.statusText}`,
        rawResponse: null,
      };
    }

    const rawResponse = await response.json();

    // Extract answer using response path
    const answer = extractByPath(rawResponse, config.responsePath || "response");

    if (answer === null || answer === undefined) {
      return {
        answer: null,
        latencyMs,
        error: `Could not extract answer at path "${config.responsePath}"`,
        rawResponse,
      };
    }

    return {
      answer: String(answer),
      latencyMs,
      error: null,
      rawResponse,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const errorMessage =
      err instanceof Error
        ? err.name === "AbortError"
          ? `Timeout after ${config.timeoutMs}ms`
          : err.message
        : "Unknown error";

    return { answer: null, latencyMs, error: errorMessage, rawResponse: null };
  }
}

/**
 * Extract a value from an object using a dot-notation path.
 * Supports: "response", "data.message", "choices.0.message.content"
 */
function extractByPath(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return null;
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }

  return current;
}
