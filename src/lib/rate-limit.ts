/**
 * Rate limiter with Upstash Redis support.
 * Uses Upstash when UPSTASH_REDIS_REST_URL is configured,
 * falls back to in-memory for local development.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Upstash Redis rate limiter (production) ──────────────────────────

const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const upstashRedis = hasUpstash ? Redis.fromEnv() : null;

// Create per-limit Upstash instances (keyed by maxRequests to differentiate tiers)
const upstashLimiters = new Map<number, Ratelimit>();

function getUpstashLimiter(maxRequests: number): Ratelimit | null {
  if (!upstashRedis) return null;
  if (!upstashLimiters.has(maxRequests)) {
    upstashLimiters.set(maxRequests, new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(maxRequests, "1 h"),
      prefix: `zikit:rl:${maxRequests}`,
    }));
  }
  return upstashLimiters.get(maxRequests)!;
}

// ── In-memory fallback (development / no Redis) ─────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

if (typeof globalThis !== "undefined" && !hasUpstash) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap) {
      if (value.resetAt < now) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

function inMemoryLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// ── Unified rate limit function ──────────────────────────────────────

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const limiter = getUpstashLimiter(maxRequests);
  if (limiter) {
    try {
      const result = await limiter.limit(key);
      return { allowed: result.success, remaining: result.remaining };
    } catch {
      // Fallback to in-memory if Redis is unreachable
      return inMemoryLimit(key, maxRequests, windowMs);
    }
  }

  return inMemoryLimit(key, maxRequests, windowMs);
}
