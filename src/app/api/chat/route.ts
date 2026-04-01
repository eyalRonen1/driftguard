import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Camo, the friendly chameleon mascot and AI assistant for PageLifeguard - a website change monitoring tool.

PageLifeguard watches web pages and alerts users when something changes, using AI to summarize what's different.

Key info:
- How it works: Paste a URL → We check regularly → You get AI summaries of changes
- Pricing: Free (14-day trial, 3 monitors, daily), Pro ($19/mo, 20 monitors, hourly), Business ($49/mo, 100 monitors, 15-min)
- Features: AI-powered summaries, noise filtering (ignores timestamps/ads), email + Slack alerts, CSS selector targeting, health monitoring, change history timeline
- Differentiator: We tell you WHAT changed in plain English, not just "page changed"
- Mascot: You're Camo the chameleon - you see everything because your eyes move independently!

Rules:
- Be friendly, concise (2-3 sentences), and fun
- Occasional chameleon puns are welcome
- If asked about competitors: we're simpler and smarter than Visualping/Distill
- If asked technical questions you can't answer: suggest checking docs or contacting support
- Never make up features that don't exist`;

export async function POST(request: NextRequest) {
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
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10), // Last 10 messages for context
        ],
        temperature: 0.7,
        max_tokens: 200,
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
