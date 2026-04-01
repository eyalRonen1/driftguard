/**
 * Structured Content Extractor - Parses HTML into meaningful sections.
 * Instead of flattening everything into one string, we preserve structure.
 * This enables section-level change detection (60-90% LLM cost savings).
 */

export interface ContentSection {
  type: "heading" | "paragraph" | "list" | "table" | "price" | "link" | "code" | "meta";
  tag: string;
  text: string;
  hash: string;
  depth: number; // heading level or nesting depth
  attributes?: Record<string, string>;
}

export interface StructuredContent {
  title: string;
  sections: ContentSection[];
  prices: string[]; // extracted price-like values
  links: string[]; // extracted URLs
  pageType: "pricing" | "news" | "docs" | "legal" | "ecommerce" | "general";
  rawTextLength: number;
}

/**
 * Extract structured content from HTML
 */
export function extractStructuredContent(html: string): StructuredContent {
  // Remove noise elements
  let clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const sections: ContentSection[] = [];

  // Extract title
  const titleMatch = clean.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || "";

  // Extract headings
  const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = headingRegex.exec(clean)) !== null) {
    const text = stripTags(match[2]).trim();
    if (text.length > 2) {
      sections.push({
        type: "heading",
        tag: match[1].toLowerCase(),
        text,
        hash: simpleHash(text),
        depth: parseInt(match[1][1]),
      });
    }
  }

  // Extract prices (numbers with currency symbols)
  const prices: string[] = [];
  const priceRegex = /(?:[$€£¥₪])\s*[\d,]+(?:\.\d{1,2})?|[\d,]+(?:\.\d{1,2})?\s*(?:[$€£¥₪])|[\d,]+(?:\.\d{1,2})?\s*(?:\/mo|\/month|\/yr|\/year|per\s+month)/gi;
  while ((match = priceRegex.exec(clean)) !== null) {
    prices.push(match[0].trim());
  }

  // Extract links
  const links: string[] = [];
  const linkRegex = /href="(https?:\/\/[^"]+)"/gi;
  while ((match = linkRegex.exec(clean)) !== null) {
    links.push(match[1]);
  }

  // Extract paragraphs
  const paraRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  while ((match = paraRegex.exec(clean)) !== null) {
    const text = stripTags(match[1]).trim();
    if (text.length > 20) {
      sections.push({
        type: "paragraph",
        tag: "p",
        text: text.slice(0, 500),
        hash: simpleHash(text),
        depth: 0,
      });
    }
  }

  // Extract list items
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  while ((match = liRegex.exec(clean)) !== null) {
    const text = stripTags(match[1]).trim();
    if (text.length > 5) {
      sections.push({
        type: "list",
        tag: "li",
        text: text.slice(0, 300),
        hash: simpleHash(text),
        depth: 0,
      });
    }
  }

  // Extract table cells for pricing detection
  const tdRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  while ((match = tdRegex.exec(clean)) !== null) {
    const text = stripTags(match[1]).trim();
    if (text.length > 2 && text.length < 200) {
      sections.push({
        type: "table",
        tag: "td",
        text,
        hash: simpleHash(text),
        depth: 0,
      });
    }
  }

  // Add price sections
  for (const price of prices) {
    sections.push({
      type: "price",
      tag: "price",
      text: price,
      hash: simpleHash(price),
      depth: 0,
    });
  }

  // Classify page type
  const pageType = classifyPageType(title, clean, prices, sections);

  const rawText = stripTags(clean).replace(/\s+/g, " ").trim();

  return {
    title,
    sections,
    prices,
    links: [...new Set(links)].slice(0, 50),
    pageType,
    rawTextLength: rawText.length,
  };
}

/**
 * Compare two structured contents and return only changed sections
 */
export function diffSections(
  before: StructuredContent,
  after: StructuredContent
): { added: ContentSection[]; removed: ContentSection[]; modified: Array<{ before: ContentSection; after: ContentSection }> } {
  const beforeHashes = new Set(before.sections.map((s) => s.hash));
  const afterHashes = new Set(after.sections.map((s) => s.hash));

  const added = after.sections.filter((s) => !beforeHashes.has(s.hash));
  const removed = before.sections.filter((s) => !afterHashes.has(s.hash));

  // Find modified sections (same type+depth, different hash)
  const modified: Array<{ before: ContentSection; after: ContentSection }> = [];
  for (const beforeSec of removed) {
    const match = added.find(
      (a) => a.type === beforeSec.type && a.depth === beforeSec.depth && a.text !== beforeSec.text
    );
    if (match) {
      modified.push({ before: beforeSec, after: match });
    }
  }

  return { added, removed, modified };
}

/**
 * Classify page type based on content
 */
function classifyPageType(
  title: string,
  html: string,
  prices: string[],
  sections: ContentSection[]
): StructuredContent["pageType"] {
  const text = (title + " " + html).toLowerCase();

  if (prices.length >= 3 || text.includes("pricing") || text.includes("plans") || text.includes("subscription")) {
    return "pricing";
  }
  if (text.includes("terms") || text.includes("privacy") || text.includes("policy") || text.includes("legal")) {
    return "legal";
  }
  if (text.includes("documentation") || text.includes("api reference") || text.includes("changelog")) {
    return "docs";
  }
  if (text.includes("article") || text.includes("published") || text.includes("author") || text.includes("breaking")) {
    return "news";
  }
  if (text.includes("add to cart") || text.includes("buy now") || text.includes("product") || prices.length >= 1) {
    return "ecommerce";
  }
  return "general";
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

function simpleHash(text: string): string {
  let hash = 0;
  const str = text.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}
