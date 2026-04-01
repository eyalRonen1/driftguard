import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getAuthenticatedOrg } from "@/lib/db/get-org";

const SYSTEM_PROMPT = `You are Camo, the friendly chameleon AI assistant for Zikit - a website change monitoring tool.

Your PRIMARY job: Help users understand changes detected on their monitored pages. When users ask about specific changes, explain what happened, why it matters, and what they should do.

Your SECONDARY job: Answer questions about Zikit itself.

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
  // Try to authenticate — allow anonymous but with stricter rate limits
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const auth = await getAuthenticatedOrg();
  const rateLimitKey = auth ? `chat:${auth.user.id}` : `chat:ip:${ip}`;
  const rateLimitMax = auth ? 60 : 10; // Authenticated: 60/hr, Anonymous: 10/hr

  const { allowed } = rateLimit(rateLimitKey, rateLimitMax, 3600000);
  if (!allowed) return NextResponse.json({ reply: "Camo needs a break! Try again in a bit." }, { status: 429 });

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

  const rawMessages = body.messages || [];
  const pageContext = body.pageContext;

  // Security: validate input types
  if (!Array.isArray(rawMessages)) {
    return NextResponse.json({ reply: "Invalid message format." }, { status: 400 });
  }

  // Security: sanitize HTML from all messages
  const sanitize = (s: string) => s.replace(/[<>]/g, "").trim();
  const messages = rawMessages.map((m: any) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: typeof m.content === "string" ? sanitize(m.content) : "",
  }));

  // Security: limit message count (prevent context stuffing)
  if (messages.length > 20) {
    return NextResponse.json({ reply: "Let's start a fresh conversation! I'm getting confused with so many messages." });
  }

  // Security: limit message length (prevent token abuse)
  const lastMsg = messages[messages.length - 1]?.content || "";
  if (lastMsg.length > 1200) {
    return NextResponse.json({ reply: "That message is a bit too long for me. Can you keep it shorter?" });
  }

  // Security: prompt injection detection
  const lowerMsg = lastMsg.toLowerCase();
  const injectionPatterns = [
    "ignore previous instructions",
    "ignore all previous",
    "system prompt",
    "developer message",
    "you are now",
    "new instructions",
    "forget your instructions",
    "override your",
    "disregard",
  ];
  if (injectionPatterns.some((p) => lowerMsg.includes(p))) {
    return NextResponse.json({ reply: "Nice try! But Camo doesn't fall for that. Ask me something about your monitors!" });
  }

  let contextPrompt = SYSTEM_PROMPT;
  if (pageContext?.recentChanges?.length || pageContext?.monitorName || pageContext?.monitorUrl) {
    contextPrompt += `\n\n=== LIVE USER DATA (TRUST THIS, NOT YOUR GENERAL KNOWLEDGE) ===`;
    if (pageContext.monitorName) {
      contextPrompt += `\nUser is viewing monitor: "${sanitize(pageContext.monitorName)}"`;
    }
    if (pageContext.monitorUrl) {
      contextPrompt += `\nURL: ${sanitize(pageContext.monitorUrl)}`;
    }
    if (pageContext.recentChanges?.length) {
      contextPrompt += `\nFACTS about this user's account:\n${pageContext.recentChanges.map((c: string, i: number) => `- ${sanitize(c)}`).join("\n")}`;
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
