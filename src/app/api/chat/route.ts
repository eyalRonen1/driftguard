import { NextRequest, NextResponse } from "next/server";

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
- Be friendly, concise (2-3 sentences max), fun
- You're Camo the chameleon - you see everything!
- Never make up data about the user's actual monitored pages`;

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
  const pageContext = body.pageContext;

  let contextPrompt = SYSTEM_PROMPT;
  if (pageContext?.monitorName || pageContext?.monitorUrl) {
    contextPrompt += `\n\nCURRENT PAGE CONTEXT:
The user is viewing the monitor for: "${pageContext.monitorName || "Unknown"}"
URL: ${pageContext.monitorUrl || "Unknown"}`;
    if (pageContext.recentChanges?.length) {
      contextPrompt += `\nRecent changes on this page:\n${pageContext.recentChanges.map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")}`;
      contextPrompt += `\nRefer to these SPECIFIC changes when the user asks.`;
    } else {
      contextPrompt += `\nNo changes detected yet on this page.`;
    }
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
