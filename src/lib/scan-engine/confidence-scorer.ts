/**
 * Composite Confidence Scorer - Combines multiple signals to determine
 * how important a detected change really is.
 *
 * Factors:
 * 1. Structural diff magnitude (how many sections changed)
 * 2. Semantic distance (embedding similarity)
 * 3. Noise score (how much is just noise)
 * 4. Page type (pricing changes > news timestamp changes)
 * 5. Content type (headings > paragraphs > list items)
 */

import type { ContentSection } from "./structured-extractor";
import type { SemanticGateResult } from "./semantic-gate";

export interface ConfidenceScore {
  overall: number; // 0-100
  structural: number; // 0-100 how much structure changed
  semantic: number; // 0-100 how much meaning changed
  noiseAdjusted: number; // 0-100 after noise filtering
  breakdown: {
    headingsChanged: number;
    pricesChanged: number;
    contentChanged: number;
    linksChanged: number;
  };
}

/**
 * Compute a composite confidence score for a detected change
 */
export function scoreConfidence({
  addedSections,
  removedSections,
  modifiedSections,
  semanticResult,
  signalScore,
  pageType,
  totalSectionsBefore,
}: {
  addedSections: ContentSection[];
  removedSections: ContentSection[];
  modifiedSections: Array<{ before: ContentSection; after: ContentSection }>;
  semanticResult: SemanticGateResult;
  signalScore: number;
  pageType: string;
  totalSectionsBefore: number;
}): ConfidenceScore {
  // 1. Structural: what percentage of sections changed
  const changedCount = addedSections.length + removedSections.length + modifiedSections.length;
  const structural = totalSectionsBefore > 0
    ? Math.min(100, (changedCount / totalSectionsBefore) * 100 * 2) // 2x multiplier for sensitivity
    : changedCount > 0 ? 50 : 0;

  // 2. Semantic: inverse of similarity (more different = higher score)
  const semantic = Math.round((1 - semanticResult.similarity) * 100);

  // 3. Content type weights
  const weights: Record<string, number> = {
    heading: 3.0,
    price: 5.0, // prices are VERY important
    table: 2.5,
    paragraph: 1.0,
    list: 1.0,
    link: 1.5,
    code: 2.0,
    meta: 0.5,
  };

  // Page type multipliers
  const pageMultipliers: Record<string, Record<string, number>> = {
    pricing: { price: 8.0, heading: 4.0 },
    legal: { paragraph: 3.0, heading: 3.0 },
    docs: { code: 4.0, heading: 3.0 },
    news: { heading: 4.0, paragraph: 1.5 },
    ecommerce: { price: 6.0, table: 3.0 },
    general: {},
  };

  const pageBoosts = pageMultipliers[pageType] || {};

  // Compute weighted change score
  let weightedScore = 0;
  const allChanged = [...addedSections, ...removedSections, ...modifiedSections.map((m) => m.after)];

  const breakdown = { headingsChanged: 0, pricesChanged: 0, contentChanged: 0, linksChanged: 0 };

  for (const section of allChanged) {
    const baseWeight = weights[section.type] || 1.0;
    const pageBoost = pageBoosts[section.type] || 1.0;
    weightedScore += baseWeight * pageBoost;

    if (section.type === "heading") breakdown.headingsChanged++;
    if (section.type === "price") breakdown.pricesChanged++;
    if (section.type === "paragraph" || section.type === "list") breakdown.contentChanged++;
    if (section.type === "link") breakdown.linksChanged++;
  }

  // Normalize weighted score to 0-100
  const maxPossibleWeight = totalSectionsBefore * 3; // assume avg weight 3
  const normalizedWeighted = maxPossibleWeight > 0
    ? Math.min(100, (weightedScore / maxPossibleWeight) * 100 * 3)
    : weightedScore > 0 ? 50 : 0;

  // 4. Noise adjustment
  const noiseAdjusted = normalizedWeighted * (signalScore / 100);

  // 5. Overall: weighted combination
  const overall = Math.round(
    structural * 0.2 +
    semantic * 0.3 +
    noiseAdjusted * 0.3 +
    normalizedWeighted * 0.2
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    structural: Math.round(structural),
    semantic,
    noiseAdjusted: Math.round(noiseAdjusted),
    breakdown,
  };
}
