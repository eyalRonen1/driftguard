/**
 * Noise Filter - Removes dynamic content that causes false positive alerts.
 * This is THE #1 differentiator based on competitive research.
 * Every competitor gets destroyed by false positives from timestamps,
 * cookie banners, rotating content, and dynamic elements.
 */

// Common noise patterns to strip before comparison
const NOISE_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  // Timestamps and dates
  { name: "iso_dates", pattern: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\s]*/g },
  { name: "readable_dates", pattern: /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi },
  { name: "numeric_dates", pattern: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g },
  { name: "time_stamps", pattern: /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b/g },
  { name: "relative_time", pattern: /\b\d+\s+(?:seconds?|minutes?|hours?|days?|weeks?|months?)\s+ago\b/gi },

  // Session/tracking tokens
  { name: "csrf_tokens", pattern: /csrf[_-]?token["\s:=]+["']?[a-zA-Z0-9_-]{20,}["']?/gi },
  { name: "nonce_values", pattern: /nonce["\s:=]+["']?[a-zA-Z0-9_-]{10,}["']?/gi },
  { name: "session_ids", pattern: /session[_-]?id["\s:=]+["']?[a-zA-Z0-9_-]{20,}["']?/gi },

  // Dynamic counters
  { name: "view_counts", pattern: /\b\d{1,3}(?:,\d{3})*\s+(?:views?|visitors?|reads?|downloads?)\b/gi },
  { name: "comment_counts", pattern: /\b\d+\s+(?:comments?|replies?|responses?)\b/gi },

  // Cookie consent / GDPR banners
  { name: "cookie_text", pattern: /(?:we use cookies|cookie policy|accept cookies|cookie consent|cookie preferences)[^.]*\./gi },
  { name: "gdpr_text", pattern: /(?:by continuing|by using this site|we value your privacy)[^.]*\./gi },

  // Social proof counters
  { name: "social_counts", pattern: /\b\d+[kKmM]?\+?\s+(?:customers?|users?|companies|teams?|businesses)\b/gi },

  // Copyright year
  { name: "copyright", pattern: /©\s*\d{4}/g },
  { name: "copyright_text", pattern: /copyright\s+\d{4}/gi },

  // Random IDs in content
  { name: "hash_ids", pattern: /\b[a-f0-9]{32,}\b/gi },
  { name: "uuid", pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi },
];

/**
 * Remove known noise patterns from text before comparison.
 * Returns cleaned text with noise replaced by stable placeholders.
 */
export function filterNoise(text: string): string {
  let cleaned = text;

  for (const { name, pattern } of NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, `[${name}]`);
  }

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Calculate a "noise score" - how much of the change is likely noise vs real content.
 * 0 = all noise, 100 = all real content change
 */
export function calculateSignalScore(
  beforeRaw: string,
  afterRaw: string,
  beforeFiltered: string,
  afterFiltered: string
): number {
  const rawChanged = beforeRaw !== afterRaw;
  const filteredChanged = beforeFiltered !== afterFiltered;

  if (!rawChanged) return 100; // Nothing changed at all
  if (!filteredChanged) return 0; // Only noise changed

  // Calculate how much of the diff is real vs noise
  const rawDiffLength = Math.abs(beforeRaw.length - afterRaw.length);
  const filteredDiffLength = Math.abs(beforeFiltered.length - afterFiltered.length);

  if (rawDiffLength === 0) return 50;

  const signalRatio = filteredDiffLength / Math.max(rawDiffLength, 1);
  return Math.min(100, Math.round(signalRatio * 100));
}

/**
 * Determine if a change should trigger an alert based on signal quality
 */
export function shouldAlert(
  signalScore: number,
  importanceScore: number,
  minImportance: number = 3
): { alert: boolean; reason: string } {
  // Pure noise - suppress completely
  if (signalScore === 0) {
    return { alert: false, reason: "Change is noise only (timestamps, counters, banners)" };
  }

  // Low signal, low importance - suppress
  if (signalScore < 30 && importanceScore < 4) {
    return { alert: false, reason: "Low-signal change with low importance" };
  }

  // Below minimum importance threshold
  if (importanceScore < minImportance) {
    return { alert: false, reason: `Importance ${importanceScore} below threshold ${minImportance}` };
  }

  // High importance always alerts regardless of signal
  if (importanceScore >= 7) {
    return { alert: true, reason: `High importance change (${importanceScore}/10)` };
  }

  // Medium importance with decent signal
  if (signalScore >= 30) {
    return { alert: true, reason: `Meaningful change detected (signal: ${signalScore}%, importance: ${importanceScore}/10)` };
  }

  return { alert: false, reason: "Change filtered as likely noise" };
}
