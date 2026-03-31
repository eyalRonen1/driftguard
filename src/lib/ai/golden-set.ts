/**
 * Golden Set Generator - Automatically generates test questions from a website.
 * Crawls the customer's website, extracts key content, and uses GPT to generate
 * the most important Q&A pairs for monitoring their chatbot.
 *
 * This is THE #1 onboarding hook. Customer must get auto-generated questions
 * within 60 seconds of signup.
 */

interface GeneratedTestCase {
  question: string;
  expectedAnswer: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
}

interface GoldenSetResult {
  tests: GeneratedTestCase[];
  pagesScanned: number;
  error: string | null;
}

const GENERATION_PROMPT = `You are analyzing a company's website to generate quality-monitoring test questions for their AI chatbot.

Based on the website content below, generate exactly 15 test questions that a chatbot for this business MUST answer correctly. Focus on:

1. **Product/Service questions** (what they sell, pricing, features) - 5 questions, priority: critical
2. **Support/FAQ questions** (common customer questions) - 4 questions, priority: high
3. **Company info questions** (about us, contact, policies) - 3 questions, priority: medium
4. **Edge case questions** (things the bot should NOT answer or should redirect) - 3 questions, priority: medium

For each question, provide the CORRECT expected answer based on the website content.

Respond ONLY in valid JSON array format:
[
  {
    "question": "What are your pricing plans?",
    "expectedAnswer": "We offer three plans: Free, Pro at $29/month, and Business at $79/month.",
    "category": "pricing",
    "priority": "critical"
  }
]

IMPORTANT:
- Keep expected answers concise (1-3 sentences)
- Base answers ONLY on information found in the website content
- If information is not available, do NOT make it up - skip that topic
- Include at least 2 questions about pricing/cost if pricing info exists
- Include at least 1 question about contact/support methods`;

/**
 * Fetch and extract text content from a URL
 */
async function fetchPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DriftGuard Bot (+https://driftguard.com)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return "";

    const html = await response.text();

    // Simple HTML to text extraction
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000); // Limit per page
  } catch {
    return "";
  }
}

/**
 * Discover key pages from a website URL
 */
async function discoverPages(baseUrl: string): Promise<string[]> {
  const url = new URL(baseUrl);
  const base = `${url.protocol}//${url.host}`;

  // Common important pages to check
  const commonPaths = [
    "/",
    "/pricing",
    "/features",
    "/about",
    "/faq",
    "/help",
    "/contact",
    "/support",
    "/docs",
    "/products",
  ];

  const pages: string[] = [];

  // Check which pages exist (parallel with limit)
  const checks = commonPaths.map(async (path) => {
    try {
      const res = await fetch(`${base}${path}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "DriftGuard Bot (+https://driftguard.com)" },
      });
      if (res.ok) return `${base}${path}`;
    } catch {
      // ignore
    }
    return null;
  });

  const results = await Promise.all(checks);
  for (const r of results) {
    if (r) pages.push(r);
  }

  // Always include the base URL
  if (!pages.includes(base) && !pages.includes(`${base}/`)) {
    pages.unshift(`${base}/`);
  }

  return pages.slice(0, 10); // Max 10 pages
}

/**
 * Generate Golden Set test cases from a website URL
 */
export async function generateGoldenSet(websiteUrl: string): Promise<GoldenSetResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { tests: [], pagesScanned: 0, error: "OpenAI API key not configured" };
  }

  try {
    // Discover and crawl pages
    const pages = await discoverPages(websiteUrl);
    const contentPromises = pages.map(fetchPageContent);
    const contents = await Promise.all(contentPromises);

    const combinedContent = contents
      .filter((c) => c.length > 100)
      .map((c, i) => `--- Page: ${pages[i]} ---\n${c}`)
      .join("\n\n")
      .slice(0, 30000); // Total limit for GPT context

    if (combinedContent.length < 200) {
      return {
        tests: [],
        pagesScanned: 0,
        error: "Could not extract enough content from the website",
      };
    }

    // Generate questions with GPT
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: GENERATION_PROMPT },
          {
            role: "user",
            content: `Here is the website content:\n\n${combinedContent}\n\nGenerate 15 test questions based on this content.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      return { tests: [], pagesScanned: pages.length, error: `OpenAI API error: ${response.status}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse JSON (handle potential markdown wrapping)
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const tests: GeneratedTestCase[] = JSON.parse(jsonStr);

    return {
      tests: tests.slice(0, 20), // Max 20 questions
      pagesScanned: pages.length,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return { tests: [], pagesScanned: 0, error: message };
  }
}
