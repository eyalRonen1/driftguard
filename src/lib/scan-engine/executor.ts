/**
 * Scan Executor - Runs all test cases against a chatbot and computes health score.
 * Includes built-in throttling (1.5s between questions by default).
 */

import { db } from "@/lib/db";
import { chatbots, testCases, scanRuns, scanResults } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { askChatbot, type ChatbotConfig } from "./adapter";
import { judge } from "./judge";

// Priority weights for health score calculation
const PRIORITY_WEIGHTS: Record<string, number> = {
  critical: 4.0,
  high: 2.5,
  medium: 1.5,
  low: 1.0,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate weighted health score from individual test results
 */
function calculateHealthScore(
  results: Array<{ score: number; priority: string; passed: boolean }>
): number {
  if (results.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const result of results) {
    const weight = PRIORITY_WEIGHTS[result.priority] || 1.0;
    weightedSum += result.score * weight;
    totalWeight += 100 * weight; // Max possible
  }

  if (totalWeight === 0) return 0;

  let score = (weightedSum / totalWeight) * 100;

  // Penalty: any critical test failure reduces score by 15 points
  const criticalFailures = results.filter(
    (r) => r.priority === "critical" && !r.passed
  ).length;
  score -= criticalFailures * 15;

  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
}

export interface ScanExecutionResult {
  scanRunId: string;
  healthScore: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorTests: number;
  durationMs: number;
}

/**
 * Execute a complete scan for a chatbot
 */
export async function executeScan(
  chatbotId: string,
  orgId: string,
  triggerType: string = "manual"
): Promise<ScanExecutionResult> {
  // Fetch chatbot config
  const [bot] = await db
    .select()
    .from(chatbots)
    .where(eq(chatbots.id, chatbotId))
    .limit(1);

  if (!bot) throw new Error("Chatbot not found");

  // Fetch active test cases
  const tests = await db
    .select()
    .from(testCases)
    .where(and(eq(testCases.chatbotId, chatbotId), eq(testCases.isActive, true)));

  if (tests.length === 0) throw new Error("No active test cases");

  // Create scan run
  const [scanRun] = await db
    .insert(scanRuns)
    .values({
      chatbotId,
      orgId,
      triggerType,
      status: "running",
      totalTests: tests.length,
      startedAt: new Date(),
    })
    .returning();

  const startTime = Date.now();
  const config: ChatbotConfig = {
    connectionType: bot.connectionType,
    endpointUrl: bot.endpointUrl,
    apiKeyEncrypted: bot.apiKeyEncrypted,
    requestTemplate: bot.requestTemplate as ChatbotConfig["requestTemplate"],
    responsePath: bot.responsePath,
    headers: bot.headers as Record<string, string> | null,
    timeoutMs: bot.timeoutMs,
  };

  const results: Array<{ score: number; priority: string; passed: boolean }> = [];
  let passedTests = 0;
  let failedTests = 0;
  let errorTests = 0;

  // Execute each test with throttling
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    // Throttle: wait between questions (default 1.5s)
    if (i > 0) {
      await sleep(bot.scanDelayMs);
    }

    // Send question to chatbot
    const adapterResult = await askChatbot(config, test.question);

    if (adapterResult.error || !adapterResult.answer) {
      // Error - couldn't get an answer
      errorTests++;
      await db.insert(scanResults).values({
        scanRunId: scanRun.id,
        testCaseId: test.id,
        questionSent: test.question,
        actualAnswer: null,
        expectedAnswer: test.expectedAnswer,
        score: "0",
        passed: false,
        matchStrategy: test.matchStrategy,
        judgeReasoning: adapterResult.error || "No answer received",
        judgeModel: "error",
        latencyMs: adapterResult.latencyMs,
        error: adapterResult.error,
      });
      results.push({ score: 0, priority: test.priority, passed: false });
      continue;
    }

    // Judge the answer
    const judgeResult = await judge({
      question: test.question,
      expectedAnswer: test.expectedAnswer,
      actualAnswer: adapterResult.answer,
      matchStrategy: test.matchStrategy,
      semanticThreshold: parseFloat(test.semanticThreshold),
    });

    if (judgeResult.passed) {
      passedTests++;
    } else {
      failedTests++;
    }

    // Store result
    await db.insert(scanResults).values({
      scanRunId: scanRun.id,
      testCaseId: test.id,
      questionSent: test.question,
      actualAnswer: adapterResult.answer,
      expectedAnswer: test.expectedAnswer,
      score: judgeResult.score.toString(),
      passed: judgeResult.passed,
      matchStrategy: test.matchStrategy,
      judgeReasoning: judgeResult.reasoning,
      judgeModel: judgeResult.model,
      latencyMs: adapterResult.latencyMs,
      error: null,
    });

    results.push({
      score: judgeResult.score,
      priority: test.priority,
      passed: judgeResult.passed,
    });

    // Update test case with latest score
    await db
      .update(testCases)
      .set({
        lastScore: judgeResult.score.toString(),
        lastTestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(testCases.id, test.id));
  }

  const durationMs = Date.now() - startTime;
  const healthScore = calculateHealthScore(results);

  // Update scan run with results
  await db
    .update(scanRuns)
    .set({
      status: "completed",
      passedTests,
      failedTests,
      errorTests,
      healthScore: healthScore.toString(),
      completedAt: new Date(),
      durationMs,
    })
    .where(eq(scanRuns.id, scanRun.id));

  // Update chatbot with latest health score
  await db
    .update(chatbots)
    .set({
      lastHealthScore: healthScore.toString(),
      lastScanAt: new Date(),
      consecutiveFailures: errorTests === tests.length ? bot.consecutiveFailures + 1 : 0,
      updatedAt: new Date(),
    })
    .where(eq(chatbots.id, chatbotId));

  return {
    scanRunId: scanRun.id,
    healthScore,
    totalTests: tests.length,
    passedTests,
    failedTests,
    errorTests,
    durationMs,
  };
}
