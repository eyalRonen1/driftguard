/**
 * AI Change Summarizer - Generates plain-English summaries of page changes.
 * Uses GPT-4o-mini for cost efficiency.
 * This is the CORE differentiator of PageLifeguard.
 */

export interface SummaryResult {
  summary: string;
  changeType: string; // content, price, removal, addition, structure
  importanceScore: number; // 1-10
  model: string;
}

const SUMMARIZER_PROMPT = `You are a website change analyst. You compare two versions of a web page and produce a clear, actionable summary of what changed.

Rules:
1. Write in plain English. No technical jargon.
2. Lead with the MOST important change.
3. Be specific: include actual numbers, names, prices, dates when present.
4. If a price changed, always state: old price → new price.
5. If content was added, summarize what was added.
6. If content was removed, note what's missing.
7. Keep the summary under 3 sentences for minor changes, under 5 for major ones.

Classify the change type as one of:
- "price" - pricing, cost, or fee changes
- "content" - text/copy changes
- "addition" - new content, sections, or features added
- "removal" - content, pages, or features removed
- "structure" - layout or navigation changes
- "minor" - trivial changes (dates, typos, formatting)

Rate importance 1-10:
- 1-3: Minor (typo fixes, date updates, formatting)
- 4-6: Notable (content updates, new sections, policy changes)
- 7-9: Important (pricing changes, feature changes, legal updates)
- 10: Critical (page removed, major policy change, service discontinuation)

Respond in JSON:
{"summary": "...", "changeType": "...", "importanceScore": N}`;

/**
 * Generate an AI summary of the difference between two page versions
 */
export async function summarizeChange(
  beforeText: string,
  afterText: string,
  pageUrl: string
): Promise<SummaryResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback: basic diff description without AI
    return {
      summary: "Page content has changed. AI summary unavailable.",
      changeType: "content",
      importanceScore: 5,
      model: "fallback",
    };
  }

  // Truncate to keep costs low
  const before = beforeText.slice(0, 4000);
  const after = afterText.slice(0, 4000);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SUMMARIZER_PROMPT },
          {
            role: "user",
            content: `Page URL: ${pageUrl}

BEFORE:
${before}

AFTER:
${after}

Summarize what changed.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        summary: "Page content has changed. AI summary generation failed.",
        changeType: "content",
        importanceScore: 5,
        model: "error",
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      return {
        summary: parsed.summary || "Page content changed.",
        changeType: parsed.changeType || "content",
        importanceScore: Math.max(1, Math.min(10, Number(parsed.importanceScore) || 5)),
        model: "gpt-4o-mini",
      };
    } catch {
      // If JSON parsing fails, use raw text
      return {
        summary: content.slice(0, 500),
        changeType: "content",
        importanceScore: 5,
        model: "gpt-4o-mini",
      };
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        summary: "Change detected (AI summary unavailable)",
        changeType: "content",
        importanceScore: 5,
        model: "timeout",
      };
    }
    return {
      summary: "Page content has changed. Summary generation failed.",
      changeType: "content",
      importanceScore: 5,
      model: "error",
    };
  } finally {
    clearTimeout(timeout);
  }
}
