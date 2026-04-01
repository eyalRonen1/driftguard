import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are Camo, the friendly chameleon AI assistant for PageLifeguard - a website change monitoring tool.

Your PRIMARY job: Help users understand changes detected on their monitored pages. When users ask about specific changes, explain what happened, why it matters, and what they should do.

Your SECONDARY job: Answer questions about PageLifeguard itself.

Product info:
- How it works: Paste a URL → We check regularly → You get AI summaries of changes
- Pricing: Free (14-day trial, 3 monitors), Pro ($19/mo, 20 monitors), Business ($49/mo, 100 monitors)
- Features: AI summaries, noise filtering, email + Slack alerts, CSS selectors, change history

When answering about changes:
- Explain in simple terms what changed and why it might matter
- Suggest actions: "You might want to update your pricing to match" or "This looks like a routine update, probably safe to ignore"
- Rate importance: "This is a big change" vs "This is minor"

Rules:
- ALWAYS respond in the SAME language the user writes in. If they write Hebrew, respond in Hebrew. If English, respond in English.
- When responding in Hebrew, use proper RTL text direction
- Be friendly, concise (2-3 sentences max), fun
- You're Camo the chameleon - you see everything!
- Never make up data about the user's actual monitored pages`;

export async function POST(request: NextRequest) {
  // Rate limit: 30 messages per hour per IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(`chat:${ip}`, 30, 3600000);
  if (!allowed) return NextResponse.json({ reply: "Camo needs a break! Try again in a few minutes." });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: "I'm taking a nap right now. Try again later!" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ reply: "Hmm, I didn't catch that. Try again?" });
  }

  const messages = body.messages || [];
  const pageContext = body.pageContext;

  let contextPrompt = SYSTEM_PROMPT;
  if (pageContext?.recentChanges?.length || pageContext?.monitorName || pageContext?.monitorUrl) {
    contextPrompt += `\n\n=== LIVE USER DATA (TRUST THIS, NOT YOUR GENERAL KNOWLEDGE) ===`;
    if (pageContext.monitorName) {
      contextPrompt += `\nUser is viewing monitor: "${pageContext.monitorName}"`;
    }
    if (pageContext.monitorUrl) {
      contextPrompt += `\nURL: ${pageContext.monitorUrl}`;
    }
    if (pageContext.recentChanges?.length) {
      contextPrompt += `\nFACTS about this user's account:\n${pageContext.recentChanges.map((c: string, i: number) => `- ${c}`).join("\n")}`;
    }
    contextPrompt += `\n\nIMPORTANT: When the user asks about their account, monitors, or changes, use ONLY the data above. Do NOT guess or use default plan limits. The data above is the truth.`;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: contextPrompt },
          ...messages.slice(-10),
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ reply: "My brain is a bit foggy. Try again in a moment!" });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I blinked and missed that. Say again?";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Something went wrong in the jungle. Try again!" });
  }
}
