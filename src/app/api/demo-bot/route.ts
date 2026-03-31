import { NextRequest, NextResponse } from "next/server";

/**
 * Demo chatbot endpoint for testing DriftGuard.
 * Simulates a support bot that answers questions about a fictional SaaS product.
 * Some answers are intentionally "drifted" to test detection.
 */

const KNOWLEDGE_BASE: Record<string, string> = {
  pricing: "We offer three plans: Free ($0/month), Pro ($29/month), and Business ($79/month). All plans include a 14-day free trial.",
  features: "DriftGuard monitors your AI chatbot 24/7, detects answer drift, generates test questions automatically, and sends instant alerts via email and Slack.",
  support: "You can reach our support team at support@driftguard.com. We respond within 24 hours on weekdays.",
  refund: "We offer a 30-day money-back guarantee on all paid plans. No questions asked.",
  integrations: "We integrate with Slack, email, and any chatbot that has an API endpoint. Webhook support coming soon.",
  security: "All data is encrypted at rest and in transit. We use AES-256 encryption for stored credentials. SOC 2 compliance is on our roadmap.",
  trial: "Yes, all paid plans come with a 14-day free trial. No credit card required to start.",
  api: "Our API documentation is available at docs.driftguard.com. You can manage chatbots, test cases, and scans programmatically.",
  company: "DriftGuard was founded in 2026. We're based in Tel Aviv, Israel. Our mission is to make AI chatbots reliable.",
  contact: "Email us at hello@driftguard.com or visit our website at driftguard.com.",
};

function findAnswer(question: string): string {
  const q = question.toLowerCase();

  for (const [key, answer] of Object.entries(KNOWLEDGE_BASE)) {
    if (q.includes(key)) return answer;
  }

  if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
    return KNOWLEDGE_BASE.pricing;
  }
  if (q.includes("feature") || q.includes("what do") || q.includes("what can")) {
    return KNOWLEDGE_BASE.features;
  }
  if (q.includes("help") || q.includes("support") || q.includes("contact")) {
    return KNOWLEDGE_BASE.support;
  }
  if (q.includes("refund") || q.includes("money back") || q.includes("cancel")) {
    return KNOWLEDGE_BASE.refund;
  }
  if (q.includes("integrate") || q.includes("slack") || q.includes("connect")) {
    return KNOWLEDGE_BASE.integrations;
  }
  if (q.includes("secure") || q.includes("encrypt") || q.includes("safe")) {
    return KNOWLEDGE_BASE.security;
  }
  if (q.includes("trial") || q.includes("free")) {
    return KNOWLEDGE_BASE.trial;
  }

  return "I'm not sure about that. Please contact our support team at support@driftguard.com for more information.";
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = body.message || body.question || body.input || "";

  if (!question) {
    return NextResponse.json({ error: "No question provided" }, { status: 400 });
  }

  // Simulate slight latency like a real bot
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

  const answer = findAnswer(question);

  return NextResponse.json({ response: answer });
}
