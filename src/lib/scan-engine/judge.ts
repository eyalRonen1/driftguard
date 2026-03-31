/**
 * LLM-as-Judge - Evaluates whether a chatbot's actual answer matches the expected answer.
 * Uses GPT-4o-mini by default for cost efficiency.
 */

export interface JudgeInput {
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  matchStrategy: string;
  semanticThreshold: number;
}

export interface JudgeResult {
  score: number; // 0-100
  passed: boolean;
  reasoning: string;
  model: string;
}

const JUDGE_SYSTEM_PROMPT = `You are an AI quality judge for chatbot monitoring. Your job is to compare a chatbot's actual answer against an expected answer.

Score the actual answer from 0 to 100:
- 100: Perfect semantic match - the actual answer conveys the same information
- 80-99: Minor differences in wording but same meaning and facts
- 50-79: Partially correct - some information matches but important details are missing or different
- 20-49: Mostly wrong - the answer addresses the topic but gives incorrect information
- 0-19: Completely wrong, off-topic, or the chatbot refused/failed to answer

Respond ONLY in valid JSON format:
{"score": <number 0-100>, "reasoning": "<one sentence explanation>"}`;

/**
 * Use LLM to judge semantic similarity between expected and actual answers
 */
async function semanticJudge(input: JudgeInput): Promise<JudgeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const model = "gpt-4o-mini"; // Cost-efficient default per design principles

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: JUDGE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Question asked: "${input.question}"

Expected answer: "${input.expectedAnswer}"

Actual answer from chatbot: "${input.actualAnswer}"

Score the actual answer (0-100) and explain.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(content);
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    return {
      score,
      passed: score >= input.semanticThreshold * 100,
      reasoning: parsed.reasoning || "No reasoning provided",
      model,
    };
  } catch {
    // If JSON parsing fails, try to extract a number
    const match = content.match(/(\d+)/);
    const score = match ? Math.max(0, Math.min(100, parseInt(match[1]))) : 0;
    return {
      score,
      passed: score >= input.semanticThreshold * 100,
      reasoning: content.slice(0, 200),
      model,
    };
  }
}

/**
 * Check if actual answer contains the expected text
 */
function containsJudge(input: JudgeInput): JudgeResult {
  const actual = input.actualAnswer.toLowerCase();
  const expected = input.expectedAnswer.toLowerCase();
  const contains = actual.includes(expected);

  return {
    score: contains ? 100 : 0,
    passed: contains,
    reasoning: contains
      ? "Answer contains the expected text"
      : "Answer does not contain the expected text",
    model: "deterministic",
  };
}

/**
 * Check if actual answer exactly matches expected answer
 */
function exactJudge(input: JudgeInput): JudgeResult {
  const matches = input.actualAnswer.trim() === input.expectedAnswer.trim();

  return {
    score: matches ? 100 : 0,
    passed: matches,
    reasoning: matches ? "Exact match" : "Answers do not match exactly",
    model: "deterministic",
  };
}

/**
 * Check if actual answer does NOT contain the expected text (for safety checks)
 */
function notContainsJudge(input: JudgeInput): JudgeResult {
  const actual = input.actualAnswer.toLowerCase();
  const forbidden = input.expectedAnswer.toLowerCase();
  const contains = actual.includes(forbidden);

  return {
    score: contains ? 0 : 100,
    passed: !contains,
    reasoning: contains
      ? `Answer contains forbidden text: "${input.expectedAnswer}"`
      : "Answer does not contain forbidden text",
    model: "deterministic",
  };
}

/**
 * Check if actual answer matches a regex pattern
 */
function regexJudge(input: JudgeInput): JudgeResult {
  try {
    const regex = new RegExp(input.expectedAnswer, "i");
    const matches = regex.test(input.actualAnswer);

    return {
      score: matches ? 100 : 0,
      passed: matches,
      reasoning: matches ? "Answer matches pattern" : "Answer does not match pattern",
      model: "deterministic",
    };
  } catch {
    return {
      score: 0,
      passed: false,
      reasoning: "Invalid regex pattern",
      model: "deterministic",
    };
  }
}

/**
 * Main judge function - routes to the appropriate strategy
 */
export async function judge(input: JudgeInput): Promise<JudgeResult> {
  switch (input.matchStrategy) {
    case "semantic":
      return semanticJudge(input);
    case "contains":
      return containsJudge(input);
    case "exact":
      return exactJudge(input);
    case "not_contains":
      return notContainsJudge(input);
    case "regex":
      return regexJudge(input);
    default:
      return semanticJudge(input);
  }
}
